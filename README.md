# Subliminal Channels

**Status:** working interactive teaching implementation with automated checks. Passing CI or successful publication is not a formal security audit. GitHub Pages publication includes an explicit source-SHA check against served bytes.

## What It Is

A browser-only ECDSA P-256/SHA-256 signature experiment. A signer can select among independently valid signatures for the same synthetic document and encode one additional agreed-upon bit in the low bit of the real ECDSA `r` value. Signatures are verified using both Noble Curves and native WebCrypto; keys and messages stay local.

## Exhibits

1. **Encode a symbol:** choose 0 or 1; use fresh extra entropy to create real P-256 signatures until one encodes the selected bit, with a bounded attempt budget.
2. **Ordinary verification:** independently check the selected signature through a separate browser API and display actual IEEE P1363 `r` and `s` fields.
3. **Discover the extra signal:** read the agreed bit back from signature bytes even though standard verification does not inspect it.
4. **Deterministic comparison:** sign the identical message twice under RFC 6979 and compare byte-identical outputs, removing this particular choice channel.
5. **Tamper:** alter the message and require ordinary verification to fail, without claiming that a mathematically valid signature is free of covert signals.

## When to Use It

A digital signature authenticates a message, but its validity check alone cannot establish whether the signer deliberately chose one of several valid encodings to convey extra information.

**Do not use:** This code with real keys, credentials, signatures, records or adversaries. The experiment isolates one mechanism; it is not a deployable cryptographic service.

## Live Demo

[Open Subliminal Channels](https://systemslibrarian.github.io/crypto-lab-subliminal-channels/). Publication is performed through GitHub Actions. The deploy job checks that the page serves the exact source commit before reporting a successful deployment. If this check fails, the public site must be treated as **unverified** even if an earlier artifact was published.

## What Can Go Wrong

This is an overtly documented, one-bit selection channel for teaching, **not encryption** and not a production covert-messaging design. Knowledge of the encoding rule reveals the symbol. Deterministic signing removes this particular random-signature choice, not all potential communication channels.

## Real-World Usage

RFC 6979 (deterministic ECDSA); FIPS 186-5 (digital signatures). Related: [ECDSA Forge](https://systemslibrarian.github.io/crypto-lab-ecdsa-forge/), [Schnorr Forge](https://systemslibrarian.github.io/crypto-lab-schnorr-forge/).

## How to Run Locally

Install with `npm ci`, run `npm test`, `npm run build`, and `npm run test:a11y` before using `npm run dev`. Browser tests serve a freshly rebuilt production artifact. Do not skip the accessibility or correctness gate.

## Related Demos

RFC 6979 (deterministic ECDSA); FIPS 186-5 (digital signatures). Related: [ECDSA Forge](https://systemslibrarian.github.io/crypto-lab-ecdsa-forge/), [Schnorr Forge](https://systemslibrarian.github.io/crypto-lab-schnorr-forge/).

## Build & Verify

The suite includes the RFC 6979 P-256/SHA-256 `sample` known-answer vector (including the normalized low-s value), deterministic repeatability, independent WebCrypto verification, chosen-bit encoding, invalid bit rejection, strict 64-byte signature encoding and altered-message rejection. Changing the message, selected bit or synthetic key retires completed evidence, and a superseded signing operation cannot restore it. Playwright verifies the actual browser output and mobile accessibility.

CI runs Vitest and Playwright, checks the production build, and refuses deployment on failures. After the Pages publish step, a fresh HTTP GET must return `deployment.json` identifying the exact `GITHUB_SHA` and GitHub repository, and a second GET must return HTML containing the app mount. The hosted source SHA is **deployed build identity evidence**, not a cryptographic security proof. Full negative-claim and mutation-test compliance remains subject to independent review.

---

*One of the browser demos in the [Crypto Lab](https://crypto-lab.systemslibrarian.dev/) suite.*

*"So whether you eat or drink or whatever you do, do it all for the glory of God." — 1 Corinthians 10:31*
