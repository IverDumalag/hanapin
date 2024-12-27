import React from 'react';
import { Box, Drawer, List, ListItem, TextField } from '@mui/material';

const UserMessagePreview = () => {
   const tempMessages = [
      {
         sender: 'Iver',
         preview: 'Hindi na kayu makaka-rest ngayong vacation. Balik academics na tayo hahahaha.',
         profilePic: 'https://via.placeholder.com/40'
      },
      {
         sender: 'Umiko',
         preview: 'Random Texts: aofnanfopsandfojnas dfjinsdnfdfasfsdf',
         profilePic: 'https://via.placeholder.com/40'
      },
      {
         sender: 'Aisha',
         preview: 'Random Texts: aofnanfopsandfojnas dfjinsdnfdfasfsdf',
         profilePic: 'https://via.placeholder.com/40'
      }
   ];

   return (
      <Drawer
         variant="permanent"
         anchor="right"
         sx={{
            width: 240,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
               width: 240,
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
            />
         </Box>
         <Box sx={{ overflow: 'auto' }}>
            <List>
               {tempMessages.map((message, index) => (
                  <MessagePreviewTemplate key={index} message={message} />
               ))}
            </List>
         </Box>
      </Drawer>
   );
};

const MessagePreviewTemplate = ({ message }) => {
   return (
      <ListItem>
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
