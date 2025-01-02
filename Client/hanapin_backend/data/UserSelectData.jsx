class UserSelectData {
   constructor() {
      this.listeners = [];
      this.selectedPostUserId = this.loadSelectedPostUserId(); // Load from sessionStorage when initialized
   }

   // Methods for managing selected post user ID
   setSelectedPostUserId(userId) {
      this.selectedPostUserId = userId;
      this.saveSelectedPostUserId(); // Save to sessionStorage whenever the data is updated
      this.notifyListeners();
   }

   getSelectedPostUserId() {
      return this.selectedPostUserId;
   }

   // Load selected post user ID from sessionStorage
   loadSelectedPostUserId() {
      const data = sessionStorage.getItem('selectedPostUserId');
      return data ? JSON.parse(data) : null;  // Return parsed data or null if not found
   }

   // Save selected post user ID to sessionStorage
   saveSelectedPostUserId() {
      sessionStorage.setItem('selectedPostUserId', JSON.stringify(this.selectedPostUserId));
   }

   subscribe(listener) {
      this.listeners.push(listener);
   }

   unsubscribe(listener) {
      this.listeners = this.listeners.filter(l => l !== listener);
   }

   notifyListeners() {
      this.listeners.forEach(listener => listener());
   }
}

const userSelectData = new UserSelectData();
export default userSelectData;