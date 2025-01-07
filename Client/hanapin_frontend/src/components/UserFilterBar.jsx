import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, TextField, Button, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const UserFilterBar = ({ onFilter }) => {
   const [barangay, setBarangay] = useState('');
   const [month, setMonth] = useState('');
   const [year, setYear] = useState('');

   const handleFilter = () => {
      onFilter({ barangay, month, year });
   };

   const handleClear = () => {
      setBarangay('');
      setMonth('');
      setYear('');
      onFilter({ barangay: '', month: '', year: '' });
   };

   const months = [
      { value: '1', label: 'January' },
      { value: '2', label: 'February' },
      { value: '3', label: 'March' },
      { value: '4', label: 'April' },
      { value: '5', label: 'May' },
      { value: '6', label: 'June' },
      { value: '7', label: 'July' },
      { value: '8', label: 'August' },
      { value: '9', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' },
   ];

   const currentYear = new Date().getFullYear();
   const years = Array.from({ length: 25 }, (_, index) => currentYear - index);

   return (
      <Drawer
         variant="permanent"
         anchor="left"
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
            <List>
               <ListItem>
                  <TextField
                     label="Filter by Barangay"
                     variant="outlined"
                     fullWidth
                     value={barangay}
                     onChange={(e) => setBarangay(e.target.value)}
                  />
               </ListItem>
               <ListItem>
                  <FormControl fullWidth>
                     <InputLabel id="month-label">Filter by Month</InputLabel>
                     <Select
                        labelId="month-label"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        label="Filter by Month"
                     >
                        {months.map((month) => (
                           <MenuItem key={month.value} value={month.value}>
                              {month.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </ListItem>
               <ListItem>
                  <FormControl fullWidth>
                     <InputLabel id="year-label">Filter by Year</InputLabel>
                     <Select
                        labelId="year-label"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        label="Filter by Year"
                     >
                        {years.map((year) => (
                           <MenuItem key={year} value={year}>
                              {year}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </ListItem>
               <ListItem>
                  <Button variant="contained" color="primary" fullWidth onClick={handleFilter}>
                     Apply Filters

                  </Button>
               </ListItem>
               <ListItem>
                  <Button variant="outlined" color="secondary" fullWidth onClick={handleClear}>
                     Clear Filters
                  </Button>
               </ListItem>
            </List>
         </Box>
      </Drawer>
   );
};

export default UserFilterBar;