import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, List, ListItem, Typography, TextField } from '@mui/material';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';
import axios from 'axios';

const UserMessages = () => {
   const [conversations, setConversations] = useState([]);
   const [selectedConversation, setSelectedConversation] = useState(null);
   const [messages, setMessages] = useState([]);
   const [newMessage, setNewMessage] = useState('');
   const [selectedParticipant, setSelectedParticipant] = useState(null);
   const [fileUrl, setFileUrl] = useState('');
   const [searchTerm, setSearchTerm] = useState('');
   const navigate = useNavigate();
   const location = useLocation();
   const userId = userLoginData.getData('user')?.user_id;

   useEffect(() => {
      fetchConversations();
   }, [userId]);

   useEffect(() => {
      const query = new URLSearchParams(location.search);
      const conversationId = query.get('conversation_id');
      if (conversationId) {
         fetchMessages(conversationId);
      }
   }, [location]);

   const fetchConversations = async () => {
      try {
         const response = await fetch('http://localhost/hanapin/Client/hanapin_backend/api/readConversationEntry.php', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
         });
         const data = await response.json();
         if (response.ok) {
            const conversationsWithDetails = await Promise.all(data.conversations.map(async (conversation) => {
               const participantId = conversation.participant_one === userId ? conversation.participant_two : conversation.participant_one;
               const participant = await fetchUserById(participantId);
               const latestMessage = await fetchLatestMessage(conversation.conversation_id);
                  const displayMessage = latestMessage
                  ? latestMessage.message_image
                     ? 'Sent an Image'
                     : latestMessage.message_text || ''
                  : 'No Messages';
               return {
                  ...conversation,
                  participant,
                  latestMessage: displayMessage,
               };
            }));
            setConversations(conversationsWithDetails);
         } else {
            console.error(data.message);
         }
      } catch (error) {
         console.error('Failed to fetch conversations:', error);
      }
   };

   const fetchUserById = async (userId) => {
      try {
         const response = await fetch('http://localhost/hanapin/Client/hanapin_backend/api/readUserByID.php', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
         });
         const data = await response.json();
         if (response.ok) {
            return data.user;
         } else {
            console.error(data.message);
            return null;
         }
      } catch (error) {
         console.error('Failed to fetch user data:', error);
         return null;
      }
   };

   const fetchLatestMessage = async (conversationId) => {
      try {
         const response = await fetch('http://localhost/hanapin/Client/hanapin_backend/api/readConversationContent.php', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ conversation_id: conversationId }),
         });
         const data = await response.json();
         if (response.ok && data.messages.length > 0) {
            return data.messages[data.messages.length - 1];
         } else {
            console.error(data.message);
            return { message_text: 'No messages' };
         }
      } catch (error) {
         console.error('Failed to fetch latest message:', error);
         return { message_text: 'No messages' };
      }
   };

   const fetchMessages = async (conversationId) => {
      try {
         const response = await fetch('http://localhost/hanapin/Client/hanapin_backend/api/readConversationContent.php', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ conversation_id: conversationId }),
         });
         const data = await response.json();
         const selectedConv = conversations.find(conv => conv.conversation_id === conversationId);
         if (selectedConv) {
            const participantId = selectedConv.participant_one === userId ? selectedConv.participant_two : selectedConv.participant_one;
            const participant = await fetchUserById(participantId);
            setSelectedParticipant(participant);
         } else {
            setSelectedParticipant(null);
         }
         if (response.ok) {
            const messagesWithUserDetails = await Promise.all(data.messages.map(async (message) => {
               const sender = await fetchUserById(message.sender_id);
               return {
                  ...message,
                  senderName: sender ? `${sender.first_name}` : 'Unknown',
               };
            }));
            setMessages(messagesWithUserDetails.length > 0 ? messagesWithUserDetails : ["No messages in this conversation."]);
            setSelectedConversation(conversationId);
         } else {
            console.error(data.message);
            setMessages(["No messages in this conversation."]);
         }
      } catch (error) {
         console.error('Failed to fetch messages:', error);
         setMessages(["No messages in this conversation."]);
      }
   };

   const handleSendMessage = async () => {
      if (!newMessage.trim() && !fileUrl) return;

      const messageData = {
         conversation_id: selectedConversation,
         sender_id: userId,
         message_text: newMessage,
         message_image: fileUrl, 
      };

      try {
         const response = await fetch('http://localhost/hanapin/Client/hanapin_backend/api/createConversationContent.php', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData),
         });

         if (response.ok) {
            fetchMessages(selectedConversation);
            await fetchConversations();
            setNewMessage('');
            setFileUrl('');
         } else {
            const error = await response.json();
            console.error(error.message);
         }
      } catch (error) {
         console.error('Error sending message:', error);
      }
   };

   const formatDate = (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
         return '';
      }
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString(undefined, options);
   };

   const googlePickerAccessToken = import.meta.env.VITE_GOOGLE_PICKER_ACCESS_TOKEN;
   const googleDriveFolderId = import.meta.env.VITE_GOOGLE_PICKER_FOLDER_ID;

   const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
         const metadata = {
            name: file.name,
            parents: [googleDriveFolderId],
         };

         const formData = new FormData();
         formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
         formData.append('file', file);

         try {
            const response = await axios.post(
               `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
               formData,
               {
                  headers: {
                     Authorization: `Bearer ${googlePickerAccessToken}`,
                     'Content-Type': 'multipart/related',
                  },
               }
            );

            const fileId = response.data.id;
            const directUrl = `https://drive.google.com/thumbnail?id=${fileId}`;

            setFileUrl(directUrl);
         } catch (error) {
            console.error('Error uploading file to Google Drive:', error);
         }
      }
   };

   const filteredConversations = conversations.filter(conversation => 
      `${conversation.participant.first_name} ${conversation.participant.last_name}`
         .toLowerCase()
         .includes(searchTerm.toLowerCase())
   );

   return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
         <Box sx={{ display: 'flex', flex: 1, padding: 1 }}>
            <Box sx={{ width: '25%', borderRight: '1px solid #e0e0e0', overflowY: 'auto' }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, marginTop: 2, marginRight:2 }}>
   <Typography variant="h4">Chat</Typography>
         <Button
         variant="contained"
         color="primary"
         onClick={() => navigate('/user_home_page')}
         sx={{
            backgroundColor: '#6a1b9a',
            color: '#fff',
            '&:hover': {
                  backgroundColor: '#4a148c',
            },
            borderRadius: '10px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'none',
         }}
      >
         Back to Home
      </Button>

      </Box>
      <List>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 1, bgcolor: 'white' }}>
            <TextField
               variant="outlined"
               placeholder="Search"
               fullWidth
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               sx={{ marginRight: 2 }}
           />
                </Box>
                <br></br>

                  {filteredConversations.map((conversation) => (
                     <ListItem
                        button
                        key={conversation.conversation_id}
                        onClick={() => {
                           setSelectedConversation(conversation.conversation_id);
                           fetchMessages(conversation.conversation_id);
                        }}
                     >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           <Box
                              component="img"
                              src={conversation.participant.profile_pic}
                              alt={`${conversation.participant.first_name} ${conversation.participant.last_name}`}
                              sx={{ width: 65, height: 65, borderRadius: '50%', marginRight: 2 }}
                           />
                           <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ fontWeight: 'bold' }}>{`${conversation.participant.first_name} ${conversation.participant.last_name}`}</Box>
                              <Box
                                 sx={{
                                    color: 'gray',
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    WebkitLineClamp: 2,
                                    lineClamp: 2,
                                    maxHeight: '3em'
                                 }}
                              >
                                 {conversation.latestMessage}
                              </Box>
                           </Box>
                        </Box>
                     </ListItem>
                  ))}
               </List>
            </Box>
            <Box 
   sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      padding: 1, 
      bgcolor: '#f9f9f9', 
      borderRadius: 2, 
      boxShadow: 2 
   }}
>
   {/* Participant Header */}
   {selectedParticipant && (
      <Box 
         sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: 2, 
            bgcolor: '#ececec', 
            borderRadius: 2, 
            marginBottom: 2,
            boxShadow: 1 
         }}
      >
         <Box
            component="img"
            src={selectedParticipant.profile_pic}
            alt={`${selectedParticipant.first_name} ${selectedParticipant.last_name}`}
            sx={{ 
               width: 60, 
               height: 60, 
               borderRadius: '50%', 
               marginRight: 2, 
               border: '2px solid #ccc' 
            }}
         />
         <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            {`${selectedParticipant.first_name} ${selectedParticipant.last_name}`}
         </Typography>
      </Box>
   )}

   {/* Chat Messages */}
   <Box 
   sx={{ 
      flex: 1, 
      overflowY: 'auto', 
      padding: 2, 
      background: 'linear-gradient(to bottom, #CDC1FF,rgb(244, 242, 247))', // Purple gradient
      borderRadius: 2, 
      boxShadow: 1 
   }}


   >
      {messages.length > 0 ? (
         messages.map((message, index) => (
            <Box
            key={index}
            sx={{
               marginBottom: 3,
               maxWidth: '50%',
               padding: 2,
               borderRadius: 2,
               backgroundColor: message.sender_id === userId ? 'white' : '#E5D9F2', 
               alignSelf: message.sender_id === userId ? 'flex-end' : 'flex-start',
               textAlign: message.sender_id === userId ? 'right' : 'left',
               boxShadow: 1,
            }}
         >
            {/* Message Text */}
            <Typography variant="body1" sx={{ color: '#333' }}>
               {message.message_text}
            </Typography>
         
            {/* Optional Image */}
            {message.message_image && (
               <Box
                  component="img"
                  src={message.message_image}
                  alt="Message Image"
                  sx={{
                     maxWidth: '100%',
                     maxHeight: 200,
                     marginTop: 1,
                     borderRadius: 2,
                     boxShadow: 1,
                  }}
               />
            )}
         
            {/* Message Metadata */}
            <Typography 
               variant="body2" 
               sx={{ marginTop: 1, color: '#6F5EFFF' }}
            >
               {message.sender_id === userId ? 'You' : message.senderName} - {formatDate(message.sent_at)}
            </Typography>
         </Box>         
         ))
      ) : (
         <Typography variant="body1" align="center" sx={{ color: '#999', marginTop: 50 }}>
            No messages yet.
         </Typography>
      )}
   </Box>
                                 
                                 <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                    {fileUrl && (
                                       <Box
                                          component="img"
                                          src={fileUrl}
                                          alt="Selected File"
                                          sx={{ maxWidth: '100%', maxHeight: 200, marginBottom: 2 }}
                                       />
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                     <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message"
                        disabled={!selectedConversation}
                        multiline
                        rows={3}
                        borderRadius= {5}
                     />
                     <Button
                        variant="contained"
                        component="label"
                        disabled={!selectedConversation}
                        sx={{
                              backgroundColor: '#6a1b9a',
                              color: '#fff',
                              '&:hover': {
                                 backgroundColor: '#4a148c',
                              },
                              borderRadius: '20px',
                              padding: '5px 20px',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              textTransform: 'none',
                              marginLeft: '10px',
                        }}
                     >
                        Add File
                        <input type="file" hidden onChange={handleFileChange} />
                     </Button>
                     <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!selectedConversation}
                        sx={{
                              backgroundColor: '#6a1b9a',
                              color: '#fff',
                              '&:hover': {
                                 backgroundColor: '#4a148c',
                              },
                              borderRadius: '20px',
                              padding: '20px 20px',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              textTransform: 'none',
                              marginLeft: '10px',
                        }}
                     >
                        Send
                     </Button>
                  </Box>
               </Box>
            </Box>
         </Box>
      </Box>
   );
};

export default UserMessages;
