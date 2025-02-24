import React, { useEffect, useState } from 'react';
import { Box, Drawer, List, ListItem, TextField, Badge } from '@mui/material';
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
         const response = await fetch(import.meta.env.VITE_API_READ_CONVERSATION_ENTRY, {
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
                  profilePic: participant.profile_pic,
                  unreadCount: conversation.unread_count || 0, // Add unread count
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
               sx={{
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '5px',
                  width: '100%',
               }}
            />
         </Box>
         <Box sx={{ overflow: 'auto' }}>
            <List>
               {filteredMessages.map((message, index) => (
                  <MessagePreviewTemplate
                     key={index}
                     message={message}
                     unreadCount={message.unreadCount} // Pass unread count
                     onClick={() => handleMessageClick(message.conversationId)}
                  />
               ))}
            </List>
         </Box>
      </Drawer>
   );
};

const MessagePreviewTemplate = ({ message, onClick, unreadCount }) => {
   return (
      <ListItem
         button
         onClick={onClick}
         sx={{
            background: 'linear-gradient(90deg, #FFFFFF 30%, #BA96DD 70%)',
            marginBottom: 1,
            borderRadius: 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
         }}
      >
         <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {/* Profile Picture */}
            <Box
               component="img"
               src={message.profilePic}
               alt={`${message.sender}'s profile`}
               sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  marginRight: 2,
                  border: '2px solid #ddd',
               }}
            />

            {/* Message Details */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
               <Box sx={{ fontFamily: 'Arial' , fontWeight: 'bold', fontSize: '18px' }}>{message.sender}</Box>
               <Box
                  sx={{
                     color: 'black',
                     fontFamily: 'Arial',
                     display: '-webkit-box',
                     WebkitBoxOrient: 'vertical',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                     WebkitLineClamp: 2,
                     fontSize: '16px',
                  }}
               >
                  {message.preview}
               </Box>
            </Box>

            {/* Unread Count */}
            {unreadCount > 0 && (
               <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{ marginLeft: 2 }}
               />
            )}
         </Box>
      </ListItem>
   );
};

export default UserMessagePreview;
