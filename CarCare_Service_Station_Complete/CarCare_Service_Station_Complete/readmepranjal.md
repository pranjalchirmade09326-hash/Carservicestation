

## 1. Project Intro (Interview me shuru me kya bolna hai?)

### 🗣️ Simple English line (jo aap aasaani se bol sako):
> *"CarCare is a web application for car service stations. Customers can add their cars and book service appointments online. The garage admin can view all bookings and update their status like pending, in-progress, or completed. I built the frontend using React, backend using Node.js and Express, and stored all data in MySQL using pure SQL queries."*

### 💡 Hindi me seedha matlab:
*"Sir, ye ek online car garage ka project hai. Customer apni gaadi register karega aur service book karega. Garage ka admin dashboard pe booking dekhega aur status update karega (jaise gaadi par kaam chal raha hai ya service complete ho gayi)."*

---

## 2. Tech Stack (Kyu use kiya? Ek-ek line me)

* **React + Vite:** Frontend ke liye. Isse fast single-page website banti hai aur page baar-baar reload nahi hota.
* **Node.js + Express:** Backend ke liye. Isse REST APIs banayi hain jo frontend aur database ke beech data laane-le-jaane ka kaam karti hain.
* **MySQL:** Database ke liye. Kyunki hamara data aapas me juda hua hai (User ki gaadi, gaadi ki booking, booking ki service).
* **mysql2:** Node.js ko MySQL se connect karne ke liye driver. Isme humne connection pool use kiya hai taaki performance fast rahe.
* **JWT (Token):** Login system ke liye. Login hone ke baad user ko ek token milta hai jisse server pehchanta hai ki user kaun hai.
* **bcryptjs:** Password security ke liye. Password ko database me seedha (plain text) save nahi karte, usko hash (code me convert) karke save karte hain.

---

## 3. Teeno Roles (Kaun kya karta hai?)

1. **User (Customer):**
   * Apni gaadi add, edit ya delete kar sakta hai.
   * Services dekh sakta hai (jaise Oil Change, Car Wash).
   * Service book kar sakta hai aur status check kar sakta hai.

2. **Admin (Garage Manager):**
   * Nayi service add ya edit kar sakta hai.
   * Saare customers ki bookings dekh sakta hai.
   * Booking ka status badal sakta hai (`pending` &rarr; `confirmed` &rarr; `in_progress` &rarr; `completed`).

3. **Super Admin (Main Owner):**
   * Admin ke saare kaam kar sakta hai + kisi bhi user ko delete kar sakta hai.

---

## 4. Database me 4 Tables hain (Bilkul simple rishte)

1. **users:** User ki info (`name`, `email`, `password`, `role`).
2. **vehicles:** Gaadi ki info (`make`, `model`, `registrationNo`, `ownerId`).
3. **services:** Kaun-kaun si services hain (`name`, `price`, `description`).
4. **bookings:** Kaunsi gaadi ki kaunsi service book hui (`userId`, `vehicleId`, `serviceId`, `date`, `status`).

### Rishte (Relations):
* Ek **User** ke paas **multiple gaadiyan** ho sakti hain (`1 : N`).
* Ek **User** ki **multiple bookings** ho sakti hain (`1 : N`).
* Ek **Gaadi** ki **multiple bookings** ho sakti hain (`1 : N`).
* **Booking table** in teeno ko aapas me jodti hai.

---

## 5. Backend ki 5 Zaroori Baatein (Jo interviewer ko batani hain)

### ① SQL Injection kaise roka?
* **Problem:** Agar user login form me galat SQL code daal de to database hack ho sakta hai.
* **Solution:** Humne **`?` placeholder (Parameterized queries)** use kiye hain:
  ```javascript
  pool.query('SELECT * FROM users WHERE email = ?', [email]);
  ```
  Isse user ka input seedha run nahi hota, safe rehta hai.

### ② Data ek hi baar me kaise laate hain? (JOIN Query)
* **Problem:** Agar 10 bookings hain, aur har booking ke liye car aur service alag-alag mangwayenge to 20-30 baar database call hoga (slow ho jayega).
* **Solution:** Humne **SQL `LEFT JOIN`** use kiya, jisse ek hi query me Booking + Car + Service ka saara data aa jata hai:
  ```sql
  SELECT bookings.*, vehicles.model, services.name 
  FROM bookings
  LEFT JOIN vehicles ON bookings.vehicleId = vehicles.id
  LEFT JOIN services ON bookings.serviceId = services.id;
  ```

### ③ Security (Doosre ki car koi aur delete na kare)
* Frontend pe button hide karne ke alawa, backend me bhi check lagaya hai:
  ```javascript
  if (vehicle.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Aap is car ke owner nahi ho" });
  }
  ```

### ④ Booking ka status workflow
* Booking step-by-step aage badhti hai:
  $$\text{pending} \longrightarrow \text{confirmed} \longrightarrow \text{in\_progress} \longrightarrow \text{completed}$$
* Ek baar service `completed` ho gayi, to customer use delete ya cancel nahi kar sakta.

### ⑤ Soft Delete kya hota hai?
* Agar hum kisi **Service** (jaise Oil Change) ko database se delete kar denge, to purani bookings ka record kharab ho jayega.
* Isliye hum use delete nahi karte, bas `isActive = 0` kar dete hain taaki naye customers ko na dikhe, par purana hisaab bana rahe.

---

## 6. HTTP Status Codes (Ek-ek line me)

* **200:** Sab sahi se mil gaya ya update ho gaya.
* **201:** Kuch naya create hua (Naya user register hua ya booking ban gayi).
* **400:** Form me kuch chhoot gaya ya galat data dala (jaise password 8 akshar se chhota hai).
* **401:** Login nahi ho ya token galat hai (*"Aap kaun ho?"*).
* **403:** Login to ho par permission nahi hai (*"Aap admin nahi ho ya ye car aapki nahi hai"*).
* **404:** Jo dhoondh rahe ho wo mila nahi (Car ID ya Booking ID galat hai).
* **409:** Duplicate cheez dali (Ye email ya car number pehle se exist karta hai).
* **500:** Backend server me kuch crash ho gaya.

---

## 7. Simple Interview Questions (Bilkul natural answers)

**Q1: 401 aur 403 me kya farak hai?**
> *"Sir, 401 ka matlab Authentication fail — matlab user ke paas token nahi hai ya token expire ho gaya. Aur 403 ka matlab Authorization fail — matlab user login to hai, par wo doosre customer ka data ya admin page access karne ki koshish kar raha hai."*

**Q2: Password seedha database me kyu nahi daala?**
> *"Sir, agar kal ko database leak ho gaya to sabke password leak ho jayenge. Isliye `bcrypt` use kiya jo password ko random salt daal kar hash bana deta hai, jise wapas decode nahi kiya ja sakta."*

**Q3: Sequelize/ORM kyu nahi use kiya? Raw MySQL kyu?**
> *"Sir, pure MySQL aur SQL queries use karne se database queries pe full control rehta hai, connection pool samajh me aata hai, aur query fast chalti hai bina kisi heavy library ke."*

**Q4: JWT Token kaise kaam karta hai?**
> *"Jab user sahi email-password daalta hai, to server use ek signed Token deta hai. Uske baad jab bhi user koi page kholta hai ya booking karta hai, wo token request header me bhejta hai. Server token verify karke data de deta hai."*

---

## 8. Test Accounts (Login karke dikhane ke liye)

* **Customer:** `customer@gmail.com` | `Password@123`
* **Admin:** `admin@carcare.com` | `Password@123`
* **Super Admin:** `superadmin@carcare.com` | `Password@123`