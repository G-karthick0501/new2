require("dotenv").config();
const mongoose = require("mongoose");
const CodingProblem = require("../models/CodingProblem");

const sampleProblems = [
  {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.

You may assume that each input has exactly one solution.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1, 2]`,
    difficulty: "easy",
    testCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1", description: "Basic case" },
      { input: "3 2 4\n6", expectedOutput: "1 2", description: "Different indices" },
      { input: "3 3\n6", expectedOutput: "0 1", description: "Duplicate values" }
    ],
    
    // ✅ Starter code - ONLY function signature (shown to user)
    starterCode: {
      python: `def twoSum(nums, target):
    # Write your code here
    pass`,
      
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    // Write your code here
    
}`,
      
      javascript: `function twoSum(nums, target) {
    // Write your code here
    
}`,
      
      java: `public int[] twoSum(int[] nums, int target) {
    // Write your code here
    
}`
    },
    
    // ✅ Driver code - Hidden wrapper (backend adds this)
    driverCode: {
      python: `# USER_CODE_HERE

if __name__ == "__main__":
    nums = list(map(int, input().split()))
    target = int(input())
    result = twoSum(nums, target)
    print(result[0], result[1])`,
    
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

// USER_CODE_HERE

int main() {
    string line;
    getline(cin, line);
    istringstream iss(line);
    vector<int> nums;
    int num;
    while (iss >> num) nums.push_back(num);
    
    int target;
    cin >> target;
    
    vector<int> result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`,
    
      javascript: `// USER_CODE_HERE

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const nums = lines[0].split(' ').map(Number);
    const target = parseInt(lines[1]);
    const result = twoSum(nums, target);
    console.log(result[0] + ' ' + result[1]);
});`
    }
  },
  {
    title: "Reverse String",
    description: `Write a function that reverses a string.

Example 1:
Input: s = "hello"
Output: "olleh"

Example 2:
Input: s = "world"
Output: "dlrow"`,
    difficulty: "easy",
    testCases: [
      { input: "hello", expectedOutput: "olleh", description: "Simple" },
      { input: "world", expectedOutput: "dlrow", description: "Another" },
      { input: "a", expectedOutput: "a", description: "Single char" }
    ],
    starterCode: {
      python: `def reverseString(s):
    # Write your code here
    pass`,
      
      cpp: `string reverseString(string s) {
    // Write your code here
    
}`,
      
      javascript: `function reverseString(s) {
    // Write your code here
    
}`
    },
    driverCode: {
      python: `# USER_CODE_HERE

if __name__ == "__main__":
    s = input()
    print(reverseString(s))`,
    
      cpp: `#include <iostream>
#include <string>
using namespace std;

// USER_CODE_HERE

int main() {
    string s;
    cin >> s;
    cout << reverseString(s) << endl;
    return 0;
}`,
    
      javascript: `// USER_CODE_HERE

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
    console.log(reverseString(line));
    rl.close();
});`
    }
  }
];

async function seed() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    console.log("🗑️  Clearing existing problems...");
    const deleted = await CodingProblem.deleteMany({});
    console.log(`   Deleted ${deleted.deletedCount} problems`);

    console.log("📝 Inserting sample problems...");
    const inserted = await CodingProblem.insertMany(sampleProblems);
    console.log(`✅ Seeded ${inserted.length} problems:`);
    inserted.forEach(p => console.log(`   - ${p.title} (${p.difficulty})`));

    console.log("\n✨ Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();