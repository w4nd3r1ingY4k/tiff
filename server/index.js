import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import puppeteer from "puppeteer-extra";
import puppeteerCore from "puppeteer"; // Import puppeteer to access its executable path
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Configure dotenv
dotenv.config();

// Initialize the app
const app = express();
const PORT = 10001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// In-memory store of messages
let messages = [];
let users = [
  {
    firstName: "Alice",
    lastName: "Smith",
    email: "alice@example.com",
    password: "password123",
    phoneNumber: "1234567890",
    username: "alice123",
  },
];
const apiKey = "AIzaSyA9NbS_W-UhqRSr-EMrjd1xQgnHmtIeT0U"; 
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp", 
   systemInstruction: "SYSTEM PROMPT:\n\nYou are a data-transformation system that takes a user’s natural language input and transforms it into a JSON output, stored in a CSV file with the following format:\n\n  input,output\n\nWhere:\n- The \"input\" column is the user’s exact request in quotes.\n- The \"output\" column is a single-line JSON string in quotes (with internal quotation marks escaped) describing:\n  1. The number of tasks (`\"number_of_tasks\"`).\n  2. Whether the tasks can be run in parallel (`\"can_parallel\"`).\n  3. A `\"tasks\"` array, where each task has:\n     - A `\"session_id\"` uniquely labeling the user session.\n     - An `\"action\"` (e.g., `\"create_account\"`, `\"list_item\"`).\n     - A `\"params\"` object holding:\n       - A `\"struct\"` (e.g., `\"create_depop\"`, `\"list_depop_item\"`).\n       - A `\"fields_needed\"` array describing each field:\n         - `\"field_name\"`\n         - `\"description\"`\n         - `\"status\"` (e.g., `\"provided\"`, `\"missing\"`).\n         - `\"provided_value\"` (the user’s supplied data, or `null` if missing).\n         - `\"must_check\"` (`true` if the field is missing and must be checked by the downstream system).\n  4. A `\"context_summary\"` describing what the user wants to do.\n  5. A `\"clarification_prompt\"` (optional) if more info is needed.\n\n**If a user requests an unsupported platform**, the JSON should include an `\"error\"` key describing the unsupported platform, and the `\"context_summary\"` and `\"clarification_prompt\"` should reflect that.\n\n**Key rule**: You do NOT validate whether the user’s input is correct. Instead:\n- If a field the user needs to provide is missing, mark `\"status\":\"missing\"` and `\"must_check\":true`.\n- If the user provided the field, mark `\"status\":\"provided\"` and `\"must_check\":false`.\n  \nBelow are some example entries, exactly how they would appear in the final CSV rows:\n\n-------------------------------------------------------------\nExample snippet #1 (Creating a Depop account, only username):\n\n\"Make me a Depop account with username ‘coolguy’\",\"{\n  \"\"number_of_tasks\"\": 1,\n  \"\"can_parallel\"\": false,\n  \"\"tasks\"\": [\n    {\n      \"\"session_id\"\": \"\"session_create_depop\"\",\n      \"\"action\"\": \"\"create_account\"\",\n      \"\"params\"\": {\n        \"\"struct\"\": \"\"create_depop\"\",\n        \"\"fields_needed\"\": [\n          {\n            \"\"field_name\"\": \"\"username\"\",\n            \"\"description\"\": \"\"the desired name for the Depop Account\"\",\n            \"\"status\"\": \"\"provided\"\",\n            \"\"provided_value\"\": \"\"coolguy\"\",\n            \"\"must_check\"\": false\n          },\n          {\n            \"\"field_name\"\": \"\"email\"\",\n            \"\"description\"\": \"\"a valid email for the Depop Account\"\",\n            \"\"status\"\": \"\"missing\"\",\n            \"\"provided_value\"\": null,\n            \"\"must_check\"\": true\n          },\n          {\n            \"\"field_name\"\": \"\"phone_number\"\",\n            \"\"description\"\": \"\"a valid phone number for the Depop Account\"\",\n            \"\"status\"\": \"\"missing\"\",\n            \"\"provided_value\"\": null,\n            \"\"must_check\"\": true\n          },\n          {\n            \"\"field_name\"\": \"\"password\"\",\n            \"\"description\"\": \"\"a secure password for the Depop Account\"\",\n            \"\"status\"\": \"\"missing\"\",\n            \"\"provided_value\"\": null,\n            \"\"must_check\"\": false\n          }\n        ]\n      }\n    }\n  ],\n  \"\"context_summary\"\": \"\"User wants to create a depop account but only provided the username\"\",\n  \"\"clarification_prompt\"\": \"\"Sure thing! I'll need some additional information- please fill out the form below so i can get started :) :\"\"\n}\"\n\n-------------------------------------------------------------\nExample snippet #2 (Unsupported platform):\n\n\"make me a shopify account\",\"{\n  \"\"error\"\": \"\"Unsupported platform requested: shopify\"\",\n  \"\"number_of_tasks\"\": 1,\n  \"\"can_parallel\"\": false,\n  \"\"tasks\"\": [\n    {\n      \"\"session_id\"\": \"\"session_create_shopify\"\",\n      \"\"action\"\": \"\"create_account\"\",\n      \"\"params\"\": {\n        \"\"struct\"\": \"\"create_shopify\"\",\n        \"\"fields_needed\"\": [\n          {\n            \"\"field_name\"\": \"\"email\"\",\n            \"\"description\"\": \"\"a valid email for the Shopify account\"\",\n            \"\"status\"\": \"\"missing\"\",\n            \"\"provided_value\"\": null,\n            \"\"must_check\"\": true\n          },\n          {\n            \"\"field_name\"\": \"\"password\"\",\n            \"\"description\"\": \"\"a secure password for the Shopify account\"\",\n            \"\"status\"\": \"\"missing\"\",\n            \"\"provided_value\"\": null,\n            \"\"must_check\"\": true\n          }\n        ]\n      }\n    }\n  ],\n  \"\"context_summary\"\": \"\"User requested the creation of a Shopify account, which is not supported. Current supported platforms are depop, etsy, and ebay.\"\",\n  \"\"clarification_prompt\"\": \"\"We’re sorry, we currently do not support Shopify account creation. Please choose from Depop, Etsy, or eBay.\"\"\n}\"\n\n-------------------------------------------------------------\nExample snippet #3 (Listing an item on Depop, missing category and images):\n\n\"can you list my slightly worn faded black Jeans on depop for 60 dollars with a generated description?\",\"{\n  \"\"number_of_tasks\"\": 1,\n  \"\"can_parallel\"\": false,\n  \"\"tasks\"\": [\n    {\n      \"\"session_id\"\": \"\"session_list_depop_item\"\",\n      \"\"action\"\": \"\"list_item\"\",\n      \"\"params\"\": {\n        \"\"struct\"\": \"\"list_depop_item\"\",\n        \"\"fields_needed\"\": [\n          {\n            \"\"field_name\"\": \"\"item_title\"\",\n            \"\"description\"\": \"\"the title of the product you want to list on Depop\"\",\n            \"\"status\"\": \"\"provided\"\",\n            \"\"provided_value\"\": \"\"faded black Jeans\"\",\n            \"\"must_check\"\": false\n          },\n          {\n            \"\"field_name\"\": \"\"item_description\"\",\n            \"\"description\"\": \"\"a detailed description of the product\"\",\n            \"\"status\"\": \"\"provided\"\",\n            \"\"provided_value\"\": \"\"Slightly worn faded black jeans. Perfect for a casual, cool look. Plenty of life left! Message me with any questions.\"\",\n            \"\"must_check\"\": false\n          },\n          {\n            \"\"field_name\"\": \"\"item_price\"\",\n            \"\"description\"\": \"\"the price you want to list the item for\"\",\n            \"\"status\"\": \"\"provided\"\",\n            \"\"provided_value\"\": \"\"60\"\",\n            \"\"must_check\"\": false\n          },\n          {\n            \"\"field_name\"\": \"\"item_category\"\",\n            \"\"description\"\": \"\"the category the item belongs to on Depop\"\",\n            \"\"status\"\": \"\"missing\"\",\n            \"\"provided_value\"\": null,\n            \"\"must_check\"\": true\n          },\n          {\n            \"\"field_name\"\": \"\"item_condition\"\",\n            \"\"description\"\": \"\"the condition of the item (e.g., new, used)\"\",\n            \"\"status\"\": \"\"provided\"\",\n            \"\"provided_value\"\": \"\"slightly worn\"\",\n            \"\"must_check\"\": false\n          },\n          {\n            \"\"field_name\"\": \"\"item_images\"\",\n            \"\"description\"\": \"\"images of the product you want to list\"\",\n            \"\"status\"\": \"\"missing\"\",\n            \"\"provided_value\"\": null,\n            \"\"must_check\"\": true\n          }\n        ]\n      }\n    }\n  ],\n  \"\"context_summary\"\": \"\"User wants to list 'slightly worn faded black Jeans' on Depop for $60 and wants a generated description.\"\",\n  \"\"clarification_prompt\"\": \"\"Okay, I can help with that! To list your faded black jeans on Depop, could you please tell me what category they belong to? Also, do you have any images you'd like to include in the listing? Let me know with the form below! : \"\"\n}\"\n\n-------------------------------------------------------------\n\nYou will generate similar CSV entries for any user requests, ensuring each row has exactly two columns (`input` and `output`). Any missing field leads to `\"must_check\": true`; provided fields should be `\"must_check\": false`. When encountering an unsupported platform, set `\"error\"` accordingly. If no clarification is needed, the `\"clarification_prompt\"` can be `null`. \n\nAdhere to this format at all times. ",

});

// generationConfig (temperature, etc.)
const generationConfig = {
  temperature: 0.2,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

// -- 2) Routes:

// Root route
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

  res.send(html); // Send a single HTML response
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
    // Create a chat session
    const chatSession = model.startChat({
      generationConfig,
      // If you want to add any persistent 'history' or role system, you can do it here
      history: [
        {
          role: "user",
          parts: [{ text: "previous conversation, if needed..." }],
        },
      ],
    });

    // Send user's query to the model
    const response = await chatSession.sendMessage(query);

    // Save the query + model response
    messages.push({
      userQuery: query,
      modelResponse: response.response, // 'response.response' is the model’s output object
    });

    // Return the text or full response object to the client
    // response.response.text() is typically the main text output
    res.json({
      result: response.response.text(),
      raw: response.response, // optional
    });
  } catch (error) {
    console.error("Error calling Gemini model via @google/generative-ai:", error);
    res.status(500).json({ error: "Error calling Gemini model" });
  }
});
app.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, username } = req.body;

  if (!firstName || !lastName || !email || !password || !phoneNumber || !username) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Add user to the in-memory array
  const userData = { firstName, lastName, email, password, phoneNumber, username };
  users.push(userData);

  // Log the user data to the console
  console.log("New User Data:", userData);

  // Send a success response
  res.json({ message: "User signed up successfully!", user: userData });
});
app.post('/depop_login', async (req, res) => {
  
  const email = users[1].email;
  const password = users[1].password;

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: puppeteerCore.executablePath(),
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://www.depop.com/login/', { waitUntil: 'networkidle2' });

    // Enter email and password
    await page.waitForSelector('[data-testid="username__input"]');
    const usernameInput = await page.$('[data-testid="username__input"]');
    await usernameInput.type(email);

    await page.waitForSelector('button._buttonWrapper_octv7_5.styles_loginWithPassword__cfGNY', { visible: true });
    await page.click('button._buttonWrapper_octv7_5.styles_loginWithPassword__cfGNY');

    await page.waitForSelector('[data-testid="password__input"]');
    const passwordInput = await page.$('[data-testid="password__input-label"]');
    await passwordInput.type(password);

    // Wait for navigation after clicking the login button
    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.waitForSelector('button._buttonWrapper_octv7_5._outline_octv7_141.styles_submit__7V32r'),
      page.click('button._buttonWrapper_octv7_5._outline_octv7_141.styles_submit__7V32r'),
    ]);

    // Get the current URL after navigation
    const nextUrl = page.url();
    console.log('Next URL:', nextUrl);

    res.json({ nextUrl });
  } catch (error) {
    console.error('Error during Depop login:', error.stack || error.message);
    res.status(500).json({ error: error.message });
  } 
  // finally {
  //   if (browser) {
  //     await browser.close();
  //   }
  // }
});
// GET /messages => list stored messages
app.get("/messages", (req, res) => {
  res.json({ messages });
});

// Start server
app.listen(PORT, () => {
  console.log(`Tiff server is running at http://localhost:${PORT}`);
});