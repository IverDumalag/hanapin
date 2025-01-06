import React, { useEffect, useState } from 'react';
import { Box, Drawer, List, ListItem, TextField } from '@mui/material';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';
import { useNavigate } from 'react-router-dom';

const UserMessagePreview = () => {
   const [messages, setMessages] = useState([]);
   const [searchQuery, setSearchQuery] = useState('');
   const navigate = useNavigate();
   const userId = userLoginData.getData('user')?.user_id;

   useEffect(() => {
      const fetchMessages = async () => {
         const fetchedMessages = await getUserMessages(userId);
         setMessages(fetchedMessages);
      };

      fetchMessages();
   }, [userId]);

   const getUserMessages = async (userId) => {
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
            const messages = await Promise.all(data.conversations.map(async (conversation) => {
               const participantId = conversation.participant_one === userId ? conversation.participant_two : conversation.participant_one;
               const participant = await fetchUserById(participantId);
               const latestMessage = await fetchLatestMessage(conversation.conversation_id);
               return {
                  conversationId: conversation.conversation_id,
                  sender: `${participant.first_name} ${participant.last_name}`,
                  preview: latestMessage.message_text,
                  profilePic: participant.profile_pic
               };
            }));
            return messages;
         } else {
            console.error(data.message);
            return [];
         }
      } catch (error) {
         console.error('Failed to fetch user messages:', error);
         return [];
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

   const handleSearchChange = (event) => {
      setSearchQuery(event.target.value);
   };

   const filteredMessages = messages.filter((message) =>
      message.sender.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const handleMessageClick = (conversationId) => {
      navigate(`/user_messages?conversation_id=${conversationId}`);
   };

   return (
      <Drawer
         variant="permanent"
         anchor="right"
         sx={{
            width: 240,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
               width: 290,
               marginTop: '64px',
               boxSizing: 'border-box',
               zIndex: 1,
            },
         }}
      >
         <Box sx={{ overflow: 'auto', padding: 2 }}>
            <TextField
               variant="outlined"
               placeholder="Search person"
               fullWidth
               value={searchQuery}
               onChange={handleSearchChange}

               sx={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', width:'100%' }}
            />
         </Box>
         <Box sx={{ overflow: 'auto' }}>
            <List>
               {filteredMessages.map((message, index) => (
                  <MessagePreviewTemplate key={index} message={message} onClick={() => handleMessageClick(message.conversationId)} />
               ))}
            </List>
         </Box>
      </Drawer>
   );
};

const MessagePreviewTemplate = ({ message, onClick }) => {
   return (
      <ListItem button onClick={onClick}>
         <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
               component="img"
               src={message.profilePic}
               alt={`${message.sender}'s profile`}
               sx={{ width: 40, height: 40, borderRadius: '50%', marginRight: 2 }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
               <Box sx={{ fontWeight: 'bold' }}>{message.sender}</Box>
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
                  {message.preview}
               </Box>
            </Box>
         </Box>
      </ListItem>
   );
};

export default UserMessagePreview;