require('dotenv').config({ path: require("path").join(__dirname, "../../.env") });
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
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: `Given a string s, find the length of the longest substring without repeating characters.

Example 1:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.

Example 2:
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.

Example 3:
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.`,
    difficulty: "medium",
    testCases: [
      { input: "abcabcbb", expectedOutput: "3", description: "Multiple substrings" },
      { input: "bbbbb", expectedOutput: "1", description: "All same" },
      { input: "pwwkew", expectedOutput: "3", description: "Non-contiguous" }
    ],
    starterCode: {
      python: `def lengthOfLongestSubstring(s):
    # Write your code here
    pass`,
      cpp: `int lengthOfLongestSubstring(string s) {
    // Write your code here
    
}`,
      javascript: `function lengthOfLongestSubstring(s) {
    // Write your code here
    
}`
    },
    driverCode: {
      python: `# USER_CODE_HERE

if __name__ == "__main__":
    s = input()
    print(lengthOfLongestSubstring(s))`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

// USER_CODE_HERE

int main() {
    string s;
    cin >> s;
    cout << lengthOfLongestSubstring(s) << endl;
    return 0;
}`,
      javascript: `// USER_CODE_HERE

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
    console.log(lengthOfLongestSubstring(line));
    rl.close();
});`
    }
  },
  {
    title: "Container With Most Water",
    description: `You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

Example 1:
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: The max area is between index 1 and 8 with area = 7 * 7 = 49

Example 2:
Input: height = [1,1]
Output: 1`,
    difficulty: "medium",
    testCases: [
      { input: "1 8 6 2 5 4 8 3 7", expectedOutput: "49", description: "Standard case" },
      { input: "1 1", expectedOutput: "1", description: "Two same heights" },
      { input: "4 3 2 1 4", expectedOutput: "16", description: "Symmetric" }
    ],
    starterCode: {
      python: `def maxArea(height):
    # Write your code here
    pass`,
      cpp: `int maxArea(vector<int>& height) {
    // Write your code here
    
}`,
      javascript: `function maxArea(height) {
    # Write your code here
    
}`
    },
    driverCode: {
      python: `# USER_CODE_HERE

if __name__ == "__main__":
    height = list(map(int, input().split()))
    print(maxArea(height))`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

// USER_CODE_HERE

int main() {
    string line;
    getline(cin, line);
    istringstream iss(line);
    vector<int> height;
    int h;
    while (iss >> h) height.push_back(h);
    
    cout << maxArea(height) << endl;
    return 0;
}`,
      javascript: `// USER_CODE_HERE

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
    const height = line.split(' ').map(Number);
    console.log(maxArea(height));
    rl.close();
});`
    }
  },
  {
    title: "3Sum",
    description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.

Example 1:
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]

Example 2:
Input: nums = [0,1,1]
Output: []

Example 3:
Input: nums = [0,0,0]
Output: [[0,0,0]]`,
    difficulty: "medium",
    testCases: [
      { input: "-1 0 1 2 -1 -4", expectedOutput: "-1 -1 2\\n-1 0 1", description: "Multiple triplets" },
      { input: "0 1 1", expectedOutput: "[]", description: "No solution" },
      { input: "0 0 0", expectedOutput: "0 0 0", description: "All zeros" }
    ],
    starterCode: {
      python: `def threeSum(nums):
    # Write your code here
    # Return list of lists
    pass`,
      cpp: `vector<vector<int>> threeSum(vector<int>& nums) {
    // Write your code here
    
}`,
      javascript: `function threeSum(nums) {
    // Write your code here
    
}`
    },
    driverCode: {
      python: `# USER_CODE_HERE

if __name__ == "__main__":
    nums = list(map(int, input().split()))
    result = threeSum(nums)
    for triplet in sorted(result):
        print(triplet[0], triplet[1], triplet[2])`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
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
    
    vector<vector<int>> result = threeSum(nums);
    sort(result.begin(), result.end());
    for (auto& triplet : result) {
        cout << triplet[0] << " " << triplet[1] << " " << triplet[2] << endl;
    }
    return 0;
}`,
      javascript: `// USER_CODE_HERE

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
    const nums = line.split(' ').map(Number);
    const result = threeSum(nums);
    result.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    result.forEach(triplet => console.log(triplet.join(' ')));
    rl.close();
});`
    }
  },
  {
    title: "Trapping Rain Water",
    description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

Example 1:
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The above elevation map (black bars) can trap 6 units of rain water (blue section).

Example 2:
Input: height = [4,2,0,3,2,5]
Output: 9`,
    difficulty: "hard",
    testCases: [
      { input: "0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6", description: "Standard case" },
      { input: "4 2 0 3 2 5", expectedOutput: "9", description: "Another case" },
      { input: "3 0 2 0 4", expectedOutput: "7", description: "Multiple gaps" }
    ],
    starterCode: {
      python: `def trap(height):
    # Write your code here
    pass`,
      cpp: `int trap(vector<int>& height) {
    // Write your code here
    
}`,
      javascript: `function trap(height) {
    // Write your code here
    
}`
    },
    driverCode: {
      python: `# USER_CODE_HERE

if __name__ == "__main__":
    height = list(map(int, input().split()))
    print(trap(height))`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

// USER_CODE_HERE

int main() {
    string line;
    getline(cin, line);
    istringstream iss(line);
    vector<int> height;
    int h;
    while (iss >> h) height.push_back(h);
    
    cout << trap(height) << endl;
    return 0;
}`,
      javascript: `// USER_CODE_HERE

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
    const height = line.split(' ').map(Number);
    console.log(trap(height));
    rl.close();
});`
    }
  },
  {
    title: "Median of Two Sorted Arrays",
    description: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).

Example 1:
Input: nums1 = [1,3], nums2 = [2]
Output: 2.0
Explanation: merged array = [1,2,3] and median is 2.

Example 2:
Input: nums1 = [1,2], nums2 = [3,4]
Output: 2.5
Explanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5`,
    difficulty: "hard",
    testCases: [
      { input: "1 3\\n2", expectedOutput: "2.0", description: "Odd length" },
      { input: "1 2\\n3 4", expectedOutput: "2.5", description: "Even length" },
      { input: "1 2 3\\n4 5 6 7", expectedOutput: "4.0", description: "Different sizes" }
    ],
    starterCode: {
      python: `def findMedianSortedArrays(nums1, nums2):
    # Write your code here
    pass`,
      cpp: `double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    // Write your code here
    
}`,
      javascript: `function findMedianSortedArrays(nums1, nums2) {
    // Write your code here
    
}`
    },
    driverCode: {
      python: `# USER_CODE_HERE

if __name__ == "__main__":
    nums1 = list(map(int, input().split()))
    nums2 = list(map(int, input().split()))
    result = findMedianSortedArrays(nums1, nums2)
    print(f"{result:.1f}")`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
#include <iomanip>
using namespace std;

// USER_CODE_HERE

int main() {
    string line;
    getline(cin, line);
    istringstream iss1(line);
    vector<int> nums1;
    int num;
    while (iss1 >> num) nums1.push_back(num);
    
    getline(cin, line);
    istringstream iss2(line);
    vector<int> nums2;
    while (iss2 >> num) nums2.push_back(num);
    
    double result = findMedianSortedArrays(nums1, nums2);
    cout << fixed << setprecision(1) << result << endl;
    return 0;
}`,
      javascript: `// USER_CODE_HERE

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const nums1 = lines[0].split(' ').map(Number);
    const nums2 = lines[1].split(' ').map(Number);
    const result = findMedianSortedArrays(nums1, nums2);
    console.log(result.toFixed(1));
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