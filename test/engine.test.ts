import { test } from "node:test";
import assert from "node:assert/strict";

import { ValidatorService } from "../src/utils/validators";
import { EncryptionService } from "../src/utils/encryption";

const validators = new ValidatorService();
const encryption = EncryptionService.getInstance();

test("email validation accepts normal addresses and rejects malformed ones", () => {
  assert.equal(validators.isValidEmail("researcher@college.edu"), true);
  assert.equal(validators.isValidEmail("no-at-sign"), false);
  assert.equal(validators.isValidEmail("spaces in@email.com"), false);
  assert.equal(validators.isValidEmail("missing@domain"), false);
});

test("password validation requires length and a digit", () => {
  assert.equal(validators.isValidPassword("Password123"), true);
  assert.equal(validators.isValidPassword("short"), false);
  assert.equal(validators.isValidPassword("nodigitshere"), false);
});

test("name validation trims whitespace", () => {
  assert.equal(validators.isValidName("  Ada Lovelace  "), true);
  assert.equal(validators.isValidName(" A "), false);
});

test("URL and JSON validation", () => {
  assert.equal(validators.isValidUrl("https://example.com/path"), true);
  assert.equal(validators.isValidUrl("not a url"), false);
  assert.equal(validators.isValidJson('{"a":1}'), true);
  assert.equal(validators.isValidJson("{broken"), false);
});

test("project name and output format are constrained", () => {
  assert.equal(validators.isValidProjectName("Quantum Insights"), true);
  assert.equal(validators.isValidProjectName(""), false);
  assert.equal(validators.isValidProjectName("x".repeat(101)), false);
  assert.equal(validators.isValidOutputFormat("markdown"), true);
  assert.equal(validators.isValidOutputFormat("exe"), false);
});

test("sanitizeInput strips angle brackets", () => {
  assert.equal(validators.sanitizeInput("  <script>alert(1)</script>  "), "scriptalert(1)/script");
});

test("email domain allow-list is enforced when supplied", () => {
  assert.equal(validators.validateEmailDomain("a@college.edu"), true);
  assert.equal(validators.validateEmailDomain("a@college.edu", ["college.edu"]), true);
  assert.equal(validators.validateEmailDomain("a@elsewhere.com", ["college.edu"]), false);
});

test("encryption round-trips objects and strings", () => {
  const payload = { userId: 7, role: "researcher" };
  const cipher = encryption.encryptData(payload);
  assert.notEqual(cipher, JSON.stringify(payload));
  assert.deepEqual(encryption.decryptData(cipher), payload);
  assert.equal(encryption.decryptData(encryption.encryptData("plain")), "plain");
});

test("hashing is deterministic and password hashes do not expose the input", () => {
  assert.equal(encryption.hashData({ a: 1 }), encryption.hashData({ a: 1 }));
  assert.notEqual(encryption.hashData({ a: 1 }), encryption.hashData({ a: 2 }));
  const hash = encryption.hashPassword("Password123");
  assert.equal(hash.length, 64);
  assert.notEqual(hash, "Password123");
});

test("generated tokens are unique and respect the requested length", () => {
  const a = encryption.generateToken(16);
  const b = encryption.generateToken(16);
  assert.equal(a.length, 16);
  assert.notEqual(a, b);
});
