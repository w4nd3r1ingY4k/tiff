import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import puppeteer from "puppeteer-extra";
import puppeteerCore from "puppeteer"; // Import puppeteer to access its executable path
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configure dotenv
dotenv.config();

// Initialize the app
const app = express();
const PORT = 10007;
let code = '0000';

// Middleware
app.use(bodyParser.json());
app.use(cors());

// In-memory store of messages and users
let messages = [];
let users = [
  {
    firstName: "martin",
    lastName: "scorcese",
    email: "realcinema1234@gmail.com",
    password: "L1v3rCu43dL()L!!",
    phoneNumber: "7865856283",
    username: "theseareclothesdude",
    code: "0000"
  },
];

const apiKey = "AIzaSyA9NbS_W-UhqRSr-EMrjd1xQgnHmtIeT0U";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction: `SYSTEM PROMPT:

You are a data-transformation system that takes a user’s natural language input and transforms it into a JSON output, stored in a CSV file with the following format:

  input,output

Where:
- The "input" column is the user’s exact request in quotes.
- The "output" column is a single-line JSON string in quotes (with internal quotation marks escaped) describing:
  1. The number of tasks ("number_of_tasks").
  2. Whether the tasks can be run in parallel ("can_parallel").
  3. A "tasks" array, where each task has:
     - A "session_id" uniquely labeling the user session.
     - An "action" (e.g., "create_account", "list_item").
     - A "params" object holding:
       - A "struct" (e.g., "create_depop", "list_depop_item").
       - A "fields_needed" array describing each field:
         - "field_name"
         - "description"
         - "status" (e.g., "provided", "missing").
         - "provided_value" (the user’s supplied data, or null if missing).
         - "must_check" (true if the field is missing and must be checked by the downstream system).
  4. A "context_summary" describing what the user wants to do.
  5. A "clarification_prompt" (optional) if more info is needed.

If a user requests an unsupported platform, the JSON should include an "error" key describing the unsupported platform, and the "context_summary" and "clarification_prompt" should reflect that.

Key rule: You do NOT validate whether the user’s input is correct. Instead:
- If a field the user needs to provide is missing, mark "status":"missing" and "must_check":true.
- If the user provided the field, mark "status":"provided" and "must_check":false.

Below are some example entries, exactly how they would appear in the final CSV rows:

-------------------------------------------------------------
Example snippet #1 (Creating a Depop account, only username):

"Make me a Depop account with username ‘coolguy’","{
  ""number_of_tasks"": 1,
  ""can_parallel"": false,
  ""tasks"": [
    {
      ""session_id"": ""session_create_depop"",
      ""action"": ""create_account"",
      ""params"": {
        ""struct"": ""create_depop"",
        ""fields_needed"": [
          {
            ""field_name"": ""username"",
            ""description"": ""the desired name for the Depop Account"",
            ""status"": ""provided"",
            ""provided_value"": ""coolguy"",
            ""must_check"": false
          },
          {
            ""field_name"": ""email"",
            ""description"": ""a valid email for the Depop Account"",
            ""status"": ""missing"",
            ""provided_value"": null,
            ""must_check"": true
          },
          {
            ""field_name"": ""phone_number"",
            ""description"": ""a valid phone number for the Depop Account"",
            ""status"": ""missing"",
            ""provided_value"": null,
            ""must_check"": true
          },
          {
            ""field_name"": ""password"",
            ""description"": ""a secure password for the Depop Account"",
            ""status"": ""missing"",
            ""provided_value"": null,
            ""must_check"": false
          }
        ]
      }
    }
  ],
  ""context_summary"": ""User wants to create a depop account but only provided the username"",
  ""clarification_prompt"": ""Sure thing! I'll need some additional information- please fill out the form below so i can get started :) :""
}"

-------------------------------------------------------------
Example snippet #2 (Unsupported platform):

"make me a shopify account","{
  ""error"": ""Unsupported platform requested: shopify"",
  ""number_of_tasks"": 1,
  ""can_parallel"": false,
  ""tasks"": [
    {
      ""session_id"": ""session_create_shopify"",
      ""action"": ""create_account"",
      ""params"": {
        ""struct"": ""create_shopify"",
        ""fields_needed"": [
          {
            ""field_name"": ""email"",
            ""description"": ""a valid email for the Shopify account"",
            ""status"": ""missing"",
            ""provided_value"": null,
            ""must_check"": true
          },
          {
            ""field_name"": ""password"",
            ""description"": ""a secure password for the Shopify account"",
            ""status"": ""missing"",
            ""provided_value"": null,
            ""must_check"": true
          }
        ]
      }
    }
  ],
  ""context_summary"": ""User requested the creation of a Shopify account, which is not supported. Current supported platforms are depop, etsy, and ebay."",
  ""clarification_prompt"": ""We’re sorry, we currently do not support Shopify account creation. Please choose from Depop, Etsy, or eBay.""
}"

-------------------------------------------------------------
Example snippet #3 (Listing an item on Depop, missing category and images):

"can you list my slightly worn faded black Jeans on depop for 60 dollars with a generated description?","{
  ""number_of_tasks"": 1,
  ""can_parallel"": false,
  ""tasks"": [
    {
      ""session_id"": ""session_list_depop_item"",
      ""action"": ""list_item"",
      ""params"": {
        ""struct"": ""list_depop_item"",
        ""fields_needed"": [
          {
            ""field_name"": ""item_title"",
            ""description"": ""the title of the product you want to list on Depop"",
            ""status"": ""provided"",
            ""provided_value"": ""faded black Jeans"",
            ""must_check"": false
          },
          {
            ""field_name"": ""item_description"",
            ""description"": ""a detailed description of the product"",
            ""status"": ""provided"",
            ""provided_value"": ""Slightly worn faded black jeans. Perfect for a casual, cool look. Plenty of life left! Message me with any questions."",
            ""must_check"": false
          },
          {
            ""field_name"": ""item_price"",
            ""description"": ""the price you want to list the item for"",
            ""status"": ""provided"",
            ""provided_value"": ""60"",
            ""must_check"": false
          },
          {
            ""field_name"": ""item_category"",
            ""description"": ""the category the item belongs to on Depop"",
            ""status"": ""missing"",
            ""provided_value"": null,
            ""must_check"": true
          },
          {
            ""field_name"": ""item_condition"",
            ""description"": ""the condition of the item (e.g., new, used)"",
            ""status"": ""provided"",
            ""provided_value"": ""slightly worn"",
            ""must_check"": false
          },
          {
            ""field_name"": ""item_images"",
            ""description"": ""images of the product you want to list"",
            ""status"": ""missing"",
            ""provided_value"": null,
            ""must_check"": true
          }
        ]
      }
    }
  ],
  ""context_summary"": ""User wants to list 'slightly worn faded black Jeans' on Depop for $60 and wants a generated description."",
  ""clarification_prompt"": ""Okay, I can help with that! To list your faded black jeans on Depop, could you please tell me what category they belong to? Also, do you have any images you'd like to include in the listing? Let me know with the form below! : ""
}"
`,
});

const generationConfig = {
  temperature: 0.2,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

// Global Puppeteer instance
let browser;
let page; // <--- Single global page instance

// Launch Puppeteer globally
(async () => {
  try {
    browser = await puppeteer.launch({
      executablePath: puppeteerCore.executablePath(),
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    console.log("Global Puppeteer browser launched");

    // Create a single, shared page
    page = await browser.newPage();
    console.log("Global Puppeteer page created");
  } catch (error) {
    console.error("Failed to launch Puppeteer:", error.message);
    process.exit(1);
  }
})();

// Initialize Express routes
app.get("/", (req, res) => {
  let html = "<h1>Signed Up Users</h1>";
  if (users.length === 0) {
    html += "<p>No users have signed up yet.</p>";
  } else {
    html += "<ul>";
    users.forEach((user, index) => {
      html += `<li>User ${index + 1}: ${JSON.stringify(user)}</li>`;
    });
    html += "</ul>";
  }
  res.send(html);
});

app.get("/say-hi", (req, res) => {
  console.log("Hi");
  res.send("Hi");
});

// GET /process-context => list stored messages
app.get("/process-context", (req, res) => {
  res.json({ messages });
});

// POST /process-context => talk to the Gemini model
app.post("/process-context", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const chatSession = model.startChat({ generationConfig });
    const response = await chatSession.sendMessage(query);

    messages.push({
      userQuery: query,
      modelResponse: response.response,
    });

    res.json({
      result: response.response.text(),
      raw: response.response,
    });
  } catch (error) {
    console.error("Error calling Gemini model:", error.message);
    res.status(500).json({ error: "Error calling Gemini model" });
  }
});

app.post("/set-otp", (req, res) => {
  console.log("OTP HIT");
  const { otp_code } = req.body; // Extract the OTP code from the request body

  if (!otp_code) {
    return res.status(400).json({ error: "OTP code is required." });
  }

  if (!users[0]) {
    return res.status(400).json({ error: "No users available to set OTP for." });
  }

  // Set the OTP code for users[0]
  users[0].code = otp_code;

  console.log(`OTP code ${otp_code} set for the 0th user:`);

  res.json({ message: `OTP code ${otp_code} has been successfully set for user ${users[0].username}.`, user: users[0] });
});

// POST /signup
app.post("/signup", (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, username } = req.body;
  if (!firstName || !lastName || !email || !password || !phoneNumber || !username) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const userData = { firstName, lastName, email, password, phoneNumber, username };
  users.push(userData);
  console.log("New User Data:", userData);
  res.json({ message: "User signed up successfully!", user: userData });
});

// POST /depop_login
app.post("/depop_login", async (req, res) => {
  const email = users[0]?.email;
  const password = users[0]?.password;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Use the global page
    await page.goto("https://www.depop.com/login/", { waitUntil: "networkidle2" });

    // Enter email
    await page.waitForSelector('[data-testid="username__input"]');
    const usernameInput = await page.$('[data-testid="username__input"]');
    await usernameInput.type(email);

    // Click "Log in with password"
    await page.waitForSelector('button._buttonWrapper_octv7_5.styles_loginWithPassword__cfGNY', { visible: true });
    await page.click('button._buttonWrapper_octv7_5.styles_loginWithPassword__cfGNY');

    // Enter password
    await page.waitForSelector('[data-testid="password__input"]');
    const passwordInput = await page.$('[data-testid="password__input-label"]');
    await passwordInput.type(password);

    // Wait for navigation after clicking the login button
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('button._buttonWrapper_octv7_5._outline_octv7_141.styles_submit__7V32r'),
    ]);

    const nextUrl = page.url();
    console.log("Next URL:", nextUrl);

    // Do NOT close the page, so you remain logged in on the same page
    // await page.close(); // <-- Removed

    res.json({ nextUrl });
  } catch (error) {
    console.error("Error during Depop login:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /depop_list_item
app.post("/depop_list_item", async (req, res) => {
  try {
    // Reuse the same page that is already logged in
    await page.goto("https://www.depop.com/products/create", { waitUntil: "networkidle2" });

    // Example: Fill out listing details
    await page.waitForSelector('[data-testid="item-title-input"]');
    const titleInput = await page.$('[data-testid="item-title-input"]');
    await titleInput.type("Cool Item");

    await page.waitForSelector('[data-testid="item-price-input"]');
    const priceInput = await page.$('[data-testid="item-price-input"]');
    await priceInput.type("50");

    // Submit the listing
    await page.click('[data-testid="submit-listing-button"]');

    res.json({ message: "Item listed successfully!" });
  } catch (error) {
    console.error("Error during item listing:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/create_depop", async (req, res) => {
  try {
    console.log(users[0]);
    await page.goto("https://www.depop.com/signup/email/", { waitUntil: "networkidle2" });
    await page.waitForSelector('[data-testid="userDetails_firstName"]');
    const first_name_input = await page.$('[data-testid="userDetails_firstName"]');
    await first_name_input.click({ clickCount: 3 });
    await first_name_input.type(users[0].firstName);

    await page.waitForSelector('[data-testid="userDetails_lastName"]');
    const last_name_input = await page.$('[data-testid="userDetails_lastName"]');
    await last_name_input.click({ clickCount: 3 });
    await last_name_input.type(users[0].lastName);

    await page.waitForSelector('[data-testid="userDetails_email"]');
    const username_input = await page.$('[data-testid="userDetails_username"]');
    await username_input.click({ clickCount: 3 });
    await username_input.type(users[0].username);

    await page.waitForSelector('[data-testid="userDetails_email"]');
    const email_input = await page.$('[data-testid="userDetails_email"]');
    await email_input.click({ clickCount: 3 });
    await email_input.type(users[0].email);

    await page.waitForSelector('[data-testid="userDetails_password"]');
    const password_input = await page.$('[data-testid="userDetails_password"]');
    await password_input.click({ clickCount: 3 });
    await password_input.type(users[0].password);
  } catch (error) {
    console.error("Error during account setup steps:", error.message);
    res.status(500).json({ error: "Failed to complete the account setup steps." });
    return; // Exit to prevent further execution
  }

  // Separate try-catch for button click
  try {
    await page.waitForSelector('.styles_submitButton__b5POn');
    await page.click('.styles_submitButton__b5POn');
    await page.waitForFunction('window.location.href === "https://www.depop.com/signup/phone/"',
      {timeout: 6000}
    );
    res.json({ message: "Successful progression to OTP" });
  } catch (error) {
    console.error("Error during submit button click:", error.message);
    res.status(500).json({ error: "Failed to click the submit button." });
  }

  try {
    await page.waitForSelector('#downshift-\\:Rnnnfauhbqla\\:-input');
  
    // Triple-click to select the current value
    const dropdownInput = await page.$('#downshift-\\:Rnnnfauhbqla\\:-input');
    await dropdownInput.click({ clickCount: 3 }); 
    await dropdownInput.press('Backspace'); // Clear existing value
  
    // Click toggle to open the dropdown
    await page.waitForSelector('button#downshift-\\:Rnnnfauhbqla\\:-toggle-button');
    await page.click('button#downshift-\\:Rnnnfauhbqla\\:-toggle-button');
  
    // Wait for dropdown list to appear
    await page.waitForSelector('ul#downshift-\\:Rnnnfauhbqla\\:-menu');
  
    // Type '1' after clearing
    await dropdownInput.type('1');
  
    // Now wait for the "United States (+1)" option to appear
    // (in the new DOM you shared, it's item-1, not item-3)
    await page.waitForSelector('#downshift-\\:Rnnnfauhbqla\\:-item-1 div._optionItemTextContainer_y8ug8_45');
    await page.click('#downshift-\\:Rnnnfauhbqla\\:-item-1 div._optionItemTextContainer_y8ug8_45');
  
    console.log('Successfully selected United States (+1).');

    await page.waitForSelector('#phoneNumber__input');

// 2. Optionally clear the field by triple-click + Backspace (similar approach as before).
const phoneInput = await page.$('#phoneNumber__input');
await phoneInput.click({ clickCount: 3 });
await phoneInput.press('Backspace');
// 3. Type your desired phone number.
await phoneInput.type('5053561226');
// Wait for the submit button to appear in the DOM
await page.waitForSelector('button._buttonWrapper_octv7_5.styles_phoneEntrySubmitButton__u78Js');
// Click it
await page.click('button._buttonWrapper_octv7_5.styles_phoneEntrySubmitButton__u78Js');
  } catch (error) {
    console.error("Error while selecting phone country code:", error.message);
    res.status(500).json({ error: "Failed to select phone country code." });
  }

  await page.waitForFunction('window.location.href === "https://www.depop.com/signup/phone-confirm/"', {timeout: 6000})
  console.log("Waiting for OTP code...");
  // Poll for the OTP code to be updated
  const waitForOTP = async () => {
    console.log("Starting to wait for OTP...");
    const timeout = Date.now() + 60000; // Set a timeout of 60 seconds
  
    while (users[0].code === '0000') {
      if (Date.now() > timeout) {
        throw new Error("Timed out waiting for OTP.");
      }
      console.log(`Current OTP code: ${users[0].code}`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Check every 1 second
    }
  };
  await waitForOTP();
  console.log("Received OTP:", users[0].code);

  try {
    // Wait for the input field with the ID "code__input" to appear in the DOM
    await page.waitForSelector('#code__input');
  
    // Select the input field
    const otpInput = await page.$('#code__input');
  
    // Click the input field to focus it
    await otpInput.click({ clickCount: 3 });
  
    // Clear any existing text
    await otpInput.press('Backspace');
  
    // Type the OTP code
    await otpInput.type(users[0].code);
  
    console.log('Successfully entered the OTP code.');
  
    // Optionally, wait for the "Next" button and click it to proceed
    await page.waitForSelector('button.styles_phoneConfirmSubmitButton__qbjMq');
    const nextButton = await page.$('button.styles_phoneConfirmSubmitButton__qbjMq');
    await nextButton.click();
  
    console.log('Successfully clicked the "Next" button.');
  } catch (error) {
    console.error('Error interacting with the OTP input field:', error.message);
  }
});



// GET /messages => list stored messages
app.get("/messages", (req, res) => {
  res.json({ messages });
});

// Gracefully close Puppeteer on server shutdown
process.on("SIGINT", async () => {
  if (browser) {
    await browser.close();
    console.log("Puppeteer browser closed");
  }
  process.exit(0);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Tiff server is running at http://localhost:${PORT}`);
});