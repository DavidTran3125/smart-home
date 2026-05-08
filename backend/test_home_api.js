

const API_URL = "http://localhost:3000/api/v1";
let authToken = "";
let homeId = "";
let inviteToken = "";

async function testHomeApi() {
  console.log("🚀 Starting Home API Tests...");

  try {
    // 1. Login with an existing Admin or Register a new one
    // We will register a new user with a unique email to try.
    // If it's not admin, createHome might fail, but let's see.
    const uniqueId = Date.now();
    console.log("1. Registering an Admin user (might be Gia đình if DB is not empty)");
    let res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `admin_${uniqueId}`,
        email: `admin_${uniqueId}@example.com`,
        password: "password123",
        full_name: "Admin Tester"
      })
    });
    
    let data = await res.json();
    console.log("Register Response:", data);

    console.log("\n2. Logging in...");
    res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `admin_${uniqueId}@example.com`,
        password: "password123",
      })
    });
    data = await res.json();
    console.log("Login Response:", data.success ? "Success (Token Hidden)" : data);
    
    if (!data.success) throw new Error("Login failed");
    authToken = data.token;
    
    // We need to make sure this user is admin to test, so we will update the DB directly just in case.
    import("mongoose").then(async (mongoose) => {
        import("./src/db/connect.js").then(async (connectDB) => {
            await connectDB.default();
            const User = (await import("./src/models/User.js")).default;
            await User.updateOne({ email: `admin_${uniqueId}@example.com` }, { role: "Admin" });
            
            // Re-login to get updated token
            res = await fetch(`${API_URL}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: `admin_${uniqueId}@example.com`, password: "password123" })
            });
            data = await res.json();
            authToken = data.token;

            console.log("\n3. Creating a Home...");
            res = await fetch(`${API_URL}/homes`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
              },
              body: JSON.stringify({ name: "My Smart Home" })
            });
            data = await res.json();
            console.log("Create Home Response:", data);
            
            if (data.success) {
                homeId = data.data._id;
                
                console.log("\n4. Inviting a Member...");
                res = await fetch(`${API_URL}/homes/invite`, {
                  method: "POST",
                  headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                  },
                  body: JSON.stringify({ homeId, email: `member_${uniqueId}@example.com` })
                });
                data = await res.json();
                console.log("Invite Member Response:", data);
                
                if (data.success && data.data) {
                    inviteToken = data.data.token;
                    
                    console.log("\n5. Registering the Invited Member...");
                    res = await fetch(`${API_URL}/homes/register`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ 
                          token: inviteToken, 
                          email: `member_${uniqueId}@example.com`,
                          username: `member_${uniqueId}`,
                          password: "password123",
                          full_name: "Member Tester"
                      })
                    });
                    data = await res.json();
                    console.log("Process Registration Response:", data);
                }
            }
            
            console.log("\n✅ Test completed.");
            process.exit(0);
        });
    });

  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testHomeApi();
