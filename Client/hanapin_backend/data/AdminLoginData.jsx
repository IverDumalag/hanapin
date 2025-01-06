class AdminLoginData {
   constructor() {
      this.listeners = [];
      this.adminData = this.loadAdminData(); // Load from sessionStorage when initialized
   }

   // Methods for managing admin data
   setData(key, data) {
      this.adminData[key] = data;
      this.saveAdminData(); // Save to sessionStorage whenever the data is updated
      this.notifyListeners();
   }

   getData(key) {
      return this.adminData[key];
   }

   // Load admin data from sessionStorage
   loadAdminData() {
      const data = sessionStorage.getItem('adminData');
      return data ? JSON.parse(data) : {};  // Return parsed data or an empty object if not found
   }

   // Save admin data to sessionStorage
   saveAdminData() {
      sessionStorage.setItem('adminData', JSON.stringify(this.adminData));
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

const adminLoginData = new AdminLoginData();
export default adminLoginData;