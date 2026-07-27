import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

export const executeCode = async (req, res) => {
  try {
    const { language, code } = req.body;

    if (!code) {
      return res.status(400).json({
        run: { output: "", stderr: "No code provided" },
      });
    }

    // Create a temporary directory for this execution
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "interviewly-exec-"));

    let fileName;
    let command;

    switch (language) {
      case "javascript":
        fileName = "Solution.js";
        command = `node "${path.join(tempDir, fileName)}"`;
        break;
      case "python":
        fileName = "Solution.py";
        command = `python "${path.join(tempDir, fileName)}"`;
        break;
      case "java":
        fileName = "Solution.java";
        command = `java "${path.join(tempDir, fileName)}"`;
        break;
      default:
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        return res.status(400).json({
          run: { output: "", stderr: `Unsupported language: ${language}` },
        });
    }

    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, code, "utf8");

    // Execute the code with a 5-second timeout
    exec(
      command,
      { timeout: 5000, cwd: tempDir },
      async (error, stdout, stderr) => {
        // Clean up temp directory
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

        if (error && error.killed) {
          return res.status(200).json({
            run: {
              output: "",
              stderr: "Execution timed out (exceeded 5 seconds limit)",
            },
          });
        }

        return res.status(200).json({
          run: {
            output: stdout || "",
            stderr: stderr || (error ? error.message : ""),
          },
        });
      }
    );
  } catch (error) {
    console.error("Error in executeCode:", error);
    res.status(500).json({
      run: { output: "", stderr: `Server error: ${error.message}` },
    });
  }
};
