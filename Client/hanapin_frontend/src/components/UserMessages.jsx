import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, List, ListItem, Typography, TextField } from '@mui/material';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';
import axios from 'axios';
import './UserMessages.css';

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
         const response = await fetch(import.meta.env.VITE_API_READ_CONVERSATION_ENTRY, {
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
         const response = await fetch(import.meta.env.VITE_API_READ_USER_BY_ID, {
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
         const response = await fetch(import.meta.env.VITE_API_READ_CONVERSATION_CONTENT, {
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
         const response = await fetch(import.meta.env.VITE_API_READ_CONVERSATION_CONTENT, {
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
         const response = await fetch(import.meta.env.VITE_API_CREATE_CONVERSATION_CONTENT, {
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
      <Box className="um-container">
         <Box className="um-inner-container">
            <Box className="um-conversations-list" sx={{ overflowY: 'auto', maxHeight: '100vh' }}>
               <Box className="um-header">
                  <Typography variant="h4">Chats</Typography>
                  <Button
                     variant="contained"
                     onClick={() => navigate('/user_home_page')}
                     className="um-back-button"
                  >
                     Back to Home
                  </Button>
               </Box>
               <List>
                  <Box className="um-search-box">
                     <TextField
                        variant="outlined"
                        placeholder="Search"
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="um-search-input"
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
                        className="um-conversation-item"
                     >
                        <Box className="um-conversation-details">
                           <Box
                              component="img"
                              src={conversation.participant.profile_pic}
                              alt={`${conversation.participant.first_name} ${conversation.participant.last_name}`}
                              className="um-conversation-avatar"
                           />
                           <Box className="um-conversation-text">
                              <Box className="um-conversation-name">{`${conversation.participant.first_name} ${conversation.participant.last_name}`}</Box>
                              <Box className="um-conversation-message">
                                 {conversation.latestMessage}
                              </Box>
                           </Box>
                        </Box>
                     </ListItem>
                  ))}
               </List>
            </Box>
            <Box className="um-chat-box" sx={{ overflowY: 'auto', maxHeight: '100vh' }}>
               {selectedParticipant && (
                  <Box className="um-participant-header">
                     <Box
                        component="img"
                        src={selectedParticipant.profile_pic}
                        alt={`${selectedParticipant.first_name} ${selectedParticipant.last_name}`}
                        className="um-participant-avatar"
                     />
                     <Typography variant="h5" className="um-participant-name">
                        {`${selectedParticipant.first_name} ${selectedParticipant.last_name}`}
                     </Typography>
                  </Box>
               )}
               <Box className="um-messages-box">
                  {messages.length > 0 ? (
                     messages.map((message, index) => (
                        <Box
                           key={index}
                           className={`um-message ${message.sender_id === userId ? 'um-message-sent' : 'um-message-received'}`}
                        >
                           <Typography variant="body1" className="um-message-text">
                              {message.message_text}
                           </Typography>
                           {message.message_image && (
                              <Box
                                 component="img"
                                 src={message.message_image}
                                 alt="Message Image"
                                 className="um-message-image"
                              />
                           )}
                           <Typography variant="body2" className="um-message-metadata">
                              {message.sender_id === userId ? 'You' : message.senderName} - {formatDate(message.sent_at)}
                           </Typography>
                        </Box>
                     ))
                  ) : (
                     <Typography variant="body1" align="center" className="um-no-messages">
                        No messages yet.
                     </Typography>
                  )}
               </Box>
               {fileUrl && (
                  <Box
                     component="img"
                     src={fileUrl}
                     alt="Selected File"
                     className="um-selected-file"
                  />
               )}
               <Box className="um-message-input-container">
                  <Box className="um-message-input-box">
                     <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        disabled={!selectedConversation}
                        multiline
                        rows={3}
                        className="um-message-input"
                     />
                     <Button
                        variant="contained"
                        component="label"
                        disabled={!selectedConversation}
                        className="um-add-file-button"
                     >
                        Add File
                        <input type="file" hidden onChange={handleFileChange} />
                     </Button>
                     <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!selectedConversation}
                        className="um-send-button"
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