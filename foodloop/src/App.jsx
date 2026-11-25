
import { useState, useEffect } from "react";
import "./App.css";

function getUrgency(expiry) {
  const remaining = new Date(expiry).getTime() - Date.now();

  if (remaining <= 0)
    return { label: "Expired", className: "expired" };

  if (remaining <= 3600000)
    return { label: "Urgent", className: "urgent" };

  if (remaining <= 10800000)
    return { label: "Collect Soon", className: "soon" };

  return { label: "Available", className: "safe" };
}

function App() {
  const [page, setPage] = useState("home");

  const [users, setUsers] = useState(() =>
    JSON.parse(localStorage.getItem("foodloopUsers") || "[]")
  );

  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("foodloopUser") || "null")
  );

  const [foods, setFoods] = useState(() =>
    JSON.parse(localStorage.getItem("foodloop") || "[]")
  );

  const [nextPage, setNextPage] = useState("dashboard");

  const [signup, setSignup] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    role: "Donor"
  });

  const [login, setLogin] = useState({
    email: "",
    password: ""
  });

  const [form, setForm] = useState({
  name: "",
  quantity: "",
  location: "",
  expiry: "",
  phone: "",
  pickupCity: ""
});

  useEffect(() => {
    localStorage.setItem("foodloop", JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem("foodloopUsers", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("foodloopUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("foodloopUser");
    }
  }, [currentUser]);

 const openPage = (target) => {
  if (target === "add") {
    if (!currentUser) {
      setNextPage("add");
      setPage("login");
      return;
    }

    if (currentUser.role !== "Donor") {
      alert("Only Donor accounts can add food.");
      setPage("dashboard");
      return;
    }
  }

  setPage(target);
};

  const handleSignup = (e) => {
    e.preventDefault();

    const email = signup.email.trim().toLowerCase();

    if (users.some(user => user.email === email)) {
      alert("This email is already registered. Please login.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: signup.name.trim(),
      email,
      password: signup.password,
      city: signup.city.trim(),
      role: signup.role
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setSignup({
      name: "",
      email: "",
      password: "",
      city: "",
      role: "Donor"
    });

    setPage("dashboard");
    alert("Account created successfully!");
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const email = login.email.trim().toLowerCase();

   let user = users.find(
  u => u.email === email && u.password === login.password
);

// Demo Admin account
if (
  email === "admin@foodloop.com" &&
  login.password === "admin123"
) {
  user = {
    name: "FoodLoop Admin",
    email: "admin@foodloop.com",
    role: "Admin",
    city: "All Cities"
  };
}

    if (!user) {
      alert("Invalid email or password!");
      return;
    }

   setCurrentUser(user);
setLogin({ email: "", password: "" });

if (user.role === "Admin") {
  setPage("admin");
} else {
  setPage(
    nextPage === "add" && user.role !== "Donor"
      ? "dashboard"
      : nextPage
  );
}
    alert("Welcome back, " + user.name + "!");
  };

  const logout = () => {
    setCurrentUser(null);
    setPage("home");
    alert("Logged out successfully!");
  };

  const addFood = (e) => {
    e.preventDefault();

    if (new Date(form.expiry).getTime() <= Date.now()) {
      alert("Please select a future expiry deadline.");
      return;
    }

    const newFood = {
  id: Date.now(),
  ...form,
  donor: currentUser.name,
  donorEmail: currentUser.email,
  status: "Available"
};

    setFoods([...foods, newFood]);

    setForm({
  name: "",
  quantity: "",
  location: "",
  expiry: "",
  phone: "",
  pickupCity: ""
});

    alert("Food donation added successfully!");
    setPage("available");
  };

  const claimFood = (id) => {
    if (!currentUser || currentUser.role !== "NGO") {
      alert("Please login with an NGO / Volunteer account.");
      return;
    }

    setFoods(foods.map(food =>
      food.id === id
        ? {
            ...food,
            status: "Claimed",
            claimedBy: currentUser.name
          }
        : food
    ));

    alert("Food successfully claimed!");
  };
  const confirmPickup = (id) => {
  setFoods(foods.map(food =>
    food.id === id
      ? { ...food, pickupConfirmed: true }
      : food
  ));

  alert("Food pickup confirmed successfully!");
};
const deleteFood = (id) => {
  if (currentUser?.role !== "Admin") {
    alert("Only Admin can delete donations!");
    return;
  }

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this donation?"
  );

  if (!confirmDelete) return;

  const updatedFoods = foods.filter(food => food.id !== id);

  setFoods(updatedFoods);
  localStorage.setItem("foodloop", JSON.stringify(updatedFoods));

  alert("Donation deleted successfully!");
};

  const available = foods.filter(
    f => f.status === "Available" &&
    new Date(f.expiry).getTime() > Date.now()
  ).length;

  const claimed = foods.filter(
    f => f.status === "Claimed"
  ).length;

  const expired = foods.filter(
    f => f.status === "Available" &&
    new Date(f.expiry).getTime() <= Date.now()
  ).length;

  const totalMeals = foods.reduce(
    (sum, f) => sum + Number(f.quantity), 0
  );
  const dashboardFoods =
  currentUser?.role === "Donor"
    ? foods.filter(food =>
        food.donorEmail === currentUser.email ||
        (!food.donorEmail && food.donor === currentUser.name)
      )
    : foods;

const dashboardAvailable = dashboardFoods.filter(
  f => f.status === "Available" &&
  new Date(f.expiry).getTime() > Date.now()
).length;

const dashboardClaimed = dashboardFoods.filter(
  f => f.status === "Claimed"
).length;

const dashboardExpired = dashboardFoods.filter(
  f => f.status === "Available" &&
  new Date(f.expiry).getTime() <= Date.now()
).length;

const dashboardMeals = dashboardFoods.reduce(
  (sum, f) => sum + Number(f.quantity), 0
);

  return (
    <div className="app">

      <nav className="navbar">
        <h2 onClick={() => setPage("home")}>🌱 FoodLoop</h2>

        <div className="navlinks">
          <button onClick={() => setPage("home")}>Home</button>

          {currentUser?.role === "Donor" && (
            <button onClick={() => openPage("add")}>
              Donate Food
            </button>
          )}

          <button onClick={() => openPage("available")}>
            Available Food
          </button>

          {currentUser && (
            <button onClick={() => setPage("dashboard")}>
              Dashboard
            </button>
          )}
          {currentUser?.role === "Admin" && (
  <button onClick={() => openPage("admin")}>
    Admin Dashboard 🛡️
  </button>
)}

          {currentUser ? (
            <>
              <span className="welcome-user">
                Hi, {currentUser.name}
              </span>
              <button className="auth-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => {
                setNextPage("dashboard");
                setPage("login");
              }}>
                Login
              </button>

              <button className="auth-btn"
                onClick={() => setPage("signup")}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {page === "home" && (
        <section className="hero">
          <div className="hero-content">
            <p className="tag">♻️ SAVE FOOD • SAVE LIVES</p>
            <h1>
              Don't Waste Food.<br />
              <span>Share Hope.</span>
            </h1>
            <p className="intro">
              Connect surplus food with people who need it.
              Together, let's build a world with zero food waste.
            </p>

            <button className="main-btn"
              onClick={() => {
                setNextPage("add");
                setPage(currentUser?.role === "Donor"
                  ? "add" : "login");
              }}>
              Donate Food →
            </button>

            <button className="second-btn"
              onClick={() => setPage("available")}>
              Find Food
            </button>

            {!currentUser && (
              <p className="home-note">
                Join FoodLoop as a Donor or NGO today!
              </p>
            )}
          </div>

          <div className="hero-icon">🥗</div>
        </section>
      )}

      {page === "signup" && (
        <section className="auth-section">
          <form className="auth-card" onSubmit={handleSignup}>
            <div className="auth-icon">🌱</div>
            <h1>Create Account</h1>
            <p>Join FoodLoop and make a difference.</p>

            <label>Full Name</label>
            <input required placeholder="Enter your name"
              value={signup.name}
              onChange={e =>
                setSignup({...signup, name: e.target.value})
              }
            />

            <label>Email Address</label>
            <input required type="email"
              placeholder="Enter your email"
              value={signup.email}
              onChange={e =>
                setSignup({...signup, email: e.target.value})
              }
            />

            <label>Password</label>
            <input required type="password" minLength="4"
              placeholder="Create a password"
              value={signup.password}
              onChange={e =>
                setSignup({...signup, password: e.target.value})
              }
            />

            <label>Your City</label>
<input
  required
  type="text"
  placeholder="Enter your city"
  value={signup.city}
  onChange={e =>
    setSignup({...signup, city: e.target.value})
  }
/>

            <label>Select Your Role</label>
            <select value={signup.role}
              onChange={e =>
                setSignup({...signup, role: e.target.value})
              }>
              <option value="Donor">Food Donor</option>
              <option value="NGO">NGO / Volunteer</option>
            </select>

            <button className="main-btn" type="submit">
              Create Account
            </button>

            <p className="auth-switch">
              Already registered?{" "}
              <span onClick={() => setPage("login")}>
                Login here
              </span>
            </p>
          </form>
        </section>
      )}

      {page === "login" && (
        <section className="auth-section">
          <form className="auth-card" onSubmit={handleLogin}>
            <div className="auth-icon">👋</div>
            <h1>Welcome Back!</h1>
            <p>Login to continue with FoodLoop.</p>

            <label>Email Address</label>
            <input required type="email"
              placeholder="Enter your email"
              value={login.email}
              onChange={e =>
                setLogin({...login, email: e.target.value})
              }
            />

            <label>Password</label>
            <input required type="password"
              placeholder="Enter your password"
              value={login.password}
              onChange={e =>
                setLogin({...login, password: e.target.value})
              }
            />

            <button className="main-btn" type="submit">
              Login
            </button>

            <p className="auth-switch">
              Don't have an account?{" "}
              <span onClick={() => setPage("signup")}>
                Sign Up
              </span>
            </p>
          </form>
        </section>
      )}

      {page === "add" && currentUser?.role === "Donor" && (
        <section className="section">
          <h1>Donate Surplus Food 🍱</h1>
          <p>Share your extra food with someone in need.</p>

          <form className="food-form" onSubmit={addFood}>
            <label>Food Name</label>
            <input required placeholder="Example: Vegetable Rice"
              value={form.name}
              onChange={e =>
                setForm({...form, name: e.target.value})
              }
            />

            <label>Quantity (Meals)</label>
            <input required type="number" min="1"
              placeholder="Example: 25"
              value={form.quantity}
              onChange={e =>
                setForm({...form, quantity: e.target.value})
              }
            />

            <label>Pickup Location</label>
            <input required placeholder="Enter location"
              value={form.location}
              onChange={e =>
                setForm({...form, location: e.target.value})
              }
              />
              <label>Pickup City</label>
<input
  required
  type="text"
  placeholder="Example: Vijayawada"
  value={form.pickupCity}
  onChange={e =>
    setForm({...form, pickupCity: e.target.value})
  }
/>
              <label>Donor WhatsApp Number</label>
<input
  required
  type="tel"
  placeholder="Example: 919876543210"
  pattern="[0-9]{10,13}"
  title="Enter 10 to 13 digits, including country code"
  value={form.phone}
  onChange={e =>
    setForm({...form, phone: e.target.value})
  }
/>

            <label>Best Before / Pickup Deadline</label>
            <input required type="datetime-local"
              value={form.expiry}
              onChange={e =>
                setForm({...form, expiry: e.target.value})
              }
            />

            <button className="main-btn" type="submit">
              Submit Donation
            </button>
          </form>
        </section>
      )}

      {page === "available" && (
        <section className="section">
          <h1>Available Food 🍽️</h1>
          <p>Find surplus food available for collection.</p>

          <div className="food-grid">
            {foods
  .filter(f =>
    f.status === "Available" &&
    new Date(f.expiry).getTime() > Date.now()
  )
  .sort((a, b) => {
    if (currentUser?.role !== "NGO") return 0;

    const userCity = (currentUser.city || "").trim().toLowerCase();
    const cityA = (a.pickupCity || "").trim().toLowerCase();
    const cityB = (b.pickupCity || "").trim().toLowerCase();

    return Number(cityB === userCity) - Number(cityA === userCity);
  })
  .map(food => (
              <div className="food-card" key={food.id}>
                <div className="food-emoji">🍱</div>
                <h3>{food.name}</h3>
                <p>👥 {food.quantity} meals</p>
                <p>📍 {food.location}</p>
                <p>🏙️ City: {food.pickupCity || "Not specified"}</p>
                <p>👤 Donor: {food.donor || "FoodLoop Donor"}</p>
                <p>⏰ Deadline: {new Date(food.expiry).toLocaleString()}</p>

               <span className={`status ${getUrgency(food.expiry).className}`}>
  {getUrgency(food.expiry).label}
</span>

               {currentUser?.role === "NGO" ? (
  <>
    {food.phone && (
      <a
        className="main-btn"
        href={`https://wa.me/${food.phone}?text=${encodeURIComponent(
          "Hi " + food.donor +
          ", I am " + currentUser.name +
          " from FoodLoop. I am interested in collecting " +
          food.name + ". Can we coordinate the pickup?"
        )}`}
        target="_blank"
        rel="noreferrer"
      >
        💬 Contact Donor on WhatsApp
      </a>
    )}

    <button
      className="main-btn"
      onClick={() => claimFood(food.id)}
    >
    </button>
    
  </>
                ) : (
                  <p className="login-hint">
                    Login as NGO / Volunteer to claim.
                  </p>
                )}
              </div>
            ))}
          </div>

          {available === 0 && (
            <p className="empty">
              No available donations yet. Be the first donor!
            </p>
          )}
        </section>
      )}
      {page === "admin" && currentUser?.role === "Admin" && (
  <section className="section">
    <h1>🛡️ FoodLoop Admin Dashboard</h1>
    <p>Manage users, donations and food pickups.</p>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "20px",
      margin: "25px 0"
    }}>

      <div className="food-card">
        <h3>👥 Total Users</h3>
        <h2>{users.length}</h2>
      </div>

      <div className="food-card">
        <h3>🍱 Total Donations</h3>
        <h2>{foods.length}</h2>
      </div>

      <div className="food-card">
        <h3>🚚 Pending Pickups</h3>
        <h2>
          {foods.filter(f =>
            f.status === "Claimed" && !f.pickupConfirmed
          ).length}
        </h2>
      </div>

      <div className="food-card">
        <h3>✅ Completed Pickups</h3>
        <h2>
          {foods.filter(f => f.pickupConfirmed).length}
        </h2>
      </div>

      <div className="food-card">
        <h3>⏰ Expired Donations</h3>
        <h2>
          {foods.filter(f =>
            new Date(f.expiry).getTime() <= Date.now()
          ).length}
        </h2>
      </div>

    </div>

    <h2>👥 Registered Users</h2>

    {users.length === 0 ? (
      <p>No users registered yet.</p>
    ) : (
      users.map(user => (
        <div className="food-card" key={user.id}>
          <h3>{user.name}</h3>
          <p>📧 {user.email}</p>
          <p>🏙️ {user.city}</p>
          <p>Role: {user.role}</p>
        </div>
      ))
    )}

    <h2 style={{ marginTop: "30px" }}>
      🍱 All Food Donations
    </h2>

    {foods.length === 0 ? (
      <p>No donations available.</p>
    ) : (
      foods.map(food => (
        <div className="food-card" key={food.id}>
          <h3>{food.name}</h3>
          <p>Quantity: {food.quantity}</p>
          <p>📍 {food.location}</p>
          <p>🏙️ {food.pickupCity}</p>
          <p>Donor: {food.donor}</p>
          <p>Status: {food.status}</p>
          <p>
            Pickup: {food.pickupConfirmed
              ? "Completed ✅"
              : food.status === "Claimed"
                ? "Pending 🚚"
                : "Not Claimed"}
          </p>
          <p>Expiry: {food.expiry}</p>
          
          {currentUser?.role === "Admin" && (
  <button onClick={() => deleteFood(food.id)}>
    🗑️ Delete Donation
  </button>
)}
        </div>
      ))
    )}

  </section>
)}

      {page === "dashboard" && currentUser && (
        <section className="section">
          <h1>Welcome, {currentUser.name}! 👋</h1>
          <p>
            {currentUser.role === "Donor"
              ? "Manage your food donations."
              : "Help rescue surplus food and reduce waste."}
          </p>

          <div className="stats">
            <div className="stat-card">
              <h2>{dashboardFoods.length}</h2>
              <p>Total Donations</p>
            </div>

            <div className="stat-card">
              <h2>{dashboardMeals}</h2>
              <p>Total Meals Listed</p>
            </div>

            <div className="stat-card">
              <h2>{dashboardClaimed}</h2>
              <p>Donations Claimed</p>
            </div>

            <div className="stat-card">
              <h2>{dashboardAvailable}</h2>
              <p>Available Donations</p>
            </div>

            <div className="stat-card">
              <h2>{dashboardExpired}</h2>
              <p>Expired Donations</p>
            </div>
          </div>

          <h2 className="subheading">
  {currentUser.role === "Donor"
    ? "My Recent Donations"
    : "Recent Donations"}
</h2>

          {dashboardFoods.map(food => {
            const isExpired =
              new Date(food.expiry).getTime() <= Date.now();

            const displayStatus =
              food.status === "Claimed"
                ? "Claimed"
                : isExpired
                ? "Expired"
                : "Available";

            return (
              <div className="recent" key={food.id}>
               <span>
  🍱 {food.name} – {food.quantity} meals

  {food.status === "Claimed" && (
   <div className="claimed-info">
  🤝 Claimed by: {food.claimedBy}

  <p>
    {food.pickupConfirmed
      ? "✅ Food Pickup Completed"
      : "⏳ Waiting for Pickup"}
  </p>
</div>
  )}
</span>
                <b className={displayStatus.toLowerCase()}>
                  {displayStatus}
                </b>
              </div>
            );
          })}

          {dashboardFoods.length === 0 && (
  <p>No donations recorded yet.</p>
)}
{currentUser.role === "NGO" && (
  <div className="claimed-section">
    <h2 className="subheading">
      📦 My Claimed Donations
    </h2>

    {foods.filter(food =>
      food.status === "Claimed" &&
      food.claimedBy === currentUser.name
    ).map(food => (
      <div className="food-card" key={food.id}>
        <h3>🍱 {food.name}</h3>

        <p>👥 Quantity: {food.quantity} meals</p>

        <p>📍 Pickup Location: {food.location}</p>

        <p>👤 Donor: {food.donor}</p>

        <p>⏰ Deadline: {
          new Date(food.expiry).toLocaleString()
        }</p>

        <badge color="success">Claimed by You</badge>
        {food.pickupConfirmed ? (
  <badge color="success">
    ✅ Pickup Completed
  </badge>
) : (
  <button
    className="main-btn"
    onClick={() => confirmPickup(food.id)}
  >
    Confirm Food Pickup
  </button>
)}

        {food.phone && (
          <a
            className="main-btn"
            href={`https://wa.me/${food.phone}?text=${encodeURIComponent(
              "Hi " + food.donor +
              ", I have claimed your " + food.name +
              " donation on FoodLoop. Let's coordinate the pickup."
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            💬 Contact Donor
          </a>
        )}
      </div>
    ))}

    {foods.filter(food =>
      food.status === "Claimed" &&
      food.claimedBy === currentUser.name
    ).length === 0 && (
      <p>You haven't claimed any donations yet.</p>
    )}
  </div>
)}

          <button className="main-btn"
            onClick={() => setPage(
              currentUser.role === "Donor" ? "add" : "available"
            )}>
            {currentUser.role === "Donor"
              ? "Add Food Donation"
              : "Explore Food Donations"}
          </button>
        </section>
      )}

      <footer>
        <h2>🌱 FoodLoop</h2>
        <p>Turning Food Waste into Food Resources.</p>
        <p>© 2026 FoodLoop | Sustainable Future</p>
      </footer>
    </div>
  );
}

export default App;
