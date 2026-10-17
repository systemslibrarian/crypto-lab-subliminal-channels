# Build brief — `crypto-lab-subliminal-channels`

**2026-10-17 · Proposed / brief only.** GitHub repository created; implementation/deployment subject to verification.

**Binding source:** [Crypto Lab Master Template](https://github.com/systemslibrarian/crypto-lab/blob/main/audits/_MASTER-TEMPLATE.md), §§0–6. Use the [per-lab kickoff](https://github.com/systemslibrarian/crypto-lab/blob/main/audits/kickoff.md) with this file as `brief.md`; the catalog's `CLAUDE.md` governs catalog changes.

```text
NEW DEMO BRIEF
- Repo name:         crypto-lab-subliminal-channels
- Short name (H1):   Subliminal Channel
- Subtitle:          ECDSA · Signing randomness · RFC 6979
- One-liner:         Generate several real, valid P-256 ECDSA signatures for one message, hide a one-bit symbol in the choice of signature, and compare that channel with deterministic RFC 6979 signing.
- Concept to teach:  A digital signature can correctly authenticate a message yet still carry information in choices the signature format or signer leaves open.
- Primitives/spec:   FIPS 186-5 (ECDSA); RFC 6979 (deterministic ECDSA and test vectors); peer-reviewed subliminal-channel literature.
- Accent (--accent): #C8A6FB (proposed; check fleet palette and contrast)
- Favicon emoji:     🪶
- In scope:          real P-256 ECDSA sign/verify with vetted library; randomness-controlled variation through a documented API; bounded candidate selection to carry one symbol; receiver decode from genuine (r,s) bytes; deterministic versus varying signatures; independent WebCrypto verification.
- Non-goals:         real exfiltration, malicious browser extensions, library backdoors, deliberately reused/broken ECDSA nonces, covert-channel stealth guarantees, private-key extraction, or a general steganography toolkit.
```

## The one question

**“If a signature is valid, does that mean it contains only a signature?”** A signer must sign the same fictional document. The learner can repeatedly generate valid randomized ECDSA signatures. Each one verifies; their encodings differ. A consenting fictional receiver has a pre-agreed rule for decoding one bit from part of the `r` component. The learner chooses a target bit and asks the signer to select a matching signature from bounded, genuine signings. An ordinary verifier says **valid** regardless of the embedded choice.

This is a demonstration of **signer-controlled choice**, not cryptographic secrecy. A watcher who learns the coding rule can decode it too. The signer legitimately possesses the signing key; the example does not teach an outsider to forge signatures.

## Separate from existing exhibits

**ECDSA Forge** already covers normal signing, RFC 6979 and disastrous nonce reuse. **Schnorr Forge** shows the BIP-340 equation and reuse. This new lab does **not** reprise private-key recovery. It shows a different and surprising property: a legitimate signer may have room to communicate *additional* information while producing independently valid signatures. Send interested learners to ECDSA Forge for nonce safety, and Commit Gate for the separate hiding/binding distinction.

## §1 / SCOPE & SECURITY / CORRECTNESS INVARIANTS

1. **Real valid signatures:** Generate P-256 ECDSA signatures using a pinned, reviewed library (`@noble/curves` is a candidate) whose exact version and signing `extraEntropy`/equivalent API have been verified. Signature verification is genuine; an independent verifier (WebCrypto P-256/SHA-256 or equivalent) must accept the output after explicitly handling DER vs IEEE P1363 and any low-`s` convention.
2. **No raw, reused or attacker-predicted nonce:** Do not hand-roll or expose `k` in the default. If the API supports fresh additional entropy, generate it with `crypto.getRandomValues` on *every attempt*. Never convert a user-chosen bit into the nonce directly. The one-bit channel uses **bounded selection among independently generated candidate signatures** rather than a weak/reused nonce formula.
3. **Selected output is still cryptographically honest:** The receiver reads its bit from the actual output `r` field, and the ordinary verifier checks the original signed message and signature. Never display the requested symbol as if decoded without reading it from the signature bytes.
4. **Bounded search:** Choose a single easy-to-compute bit (for example, the low bit of a canonical `r` encoding). Try fresh signings until it matches or a strict attempt cap is reached. If no match, report “No matching signature in N attempts”; never fake a signature.
5. **Deterministic comparison is scoped:** RFC 6979 repeated signing of identical message/key yields identical signatures for the exact pinned settings. This removes this particular randomized-choice channel; it does **not** prove deterministic signing eliminates all covert channels (message choice, metadata, key selection, or external timing can still vary).
6. **Keep secrets in memory:** Fictional signing key generated per session; no key upload/persistence, network calls or telemetry. Key-related bytes visible only in an opt-in expert panel, never used as real credentials.
7. **Protocol framing:** A valid signature proves the private-key holder signed the chosen bytes under the scheme's assumptions, not that the holder is trustworthy or that a signature is information-free.

### ARCHITECTURE

- `src/ecdsa/sign.ts`: pinned library adapter, curve parameters, signature parse/serialize and strict validation; cross-verify via separate API.
- `src/ecdsa/deterministic.ts`: RFC 6979 mode and pinned known-answer fixtures; document version, hash and low-`s` policy.
- `src/channel/encode.ts`: bounded candidate selection with fresh entropy and no custom nonce arithmetic.
- `src/channel/decode.ts`: reads the agreed bit *from actual signature bytes* and returns it independent of message labels.
- `src/ui/`: signer, ordinary verifier, receiving observer; signature gallery; mode switch; expert `r`/`s` panel; mechanism trace.
- One `// [extension] point` for future analysis of channel capacity/detection; do not build a covert traffic generator or data exfiltration feature.

### UI / THE ONE INTERACTION

1. **Normal signing:** Sign a fixed fictional message with P-256 ECDSA and see `VALID` on a genuine verifier.
2. **Ask for one bit:** Select `0` or `1` as the extra symbol. Press **“Encode with another valid signature”**. The signer generates fresh candidate signatures, shows attempt count and which real `r`-bit matched. Candidate signatures stay expandable and verifiable.
3. **Show two checks:** “Signature valid: YES” and “Hidden symbol read: 1.” The learner sees both computed independently. Tamper with message or signature to make the *actual* verifier reject, while decoding bytes alone is not authentication.
4. **Turn on deterministic RFC 6979:** Re-sign the same document with the same key and see why an identical output blocks this randomized-selection strategy. Make a different message and explain why the broader covert-channel problem is not solved universally.
5. **Expert view:** Hex `r,s`, canonical encoding, nonce-generation inputs described conceptually (but not exposed secret nonce), low-`s` handling, verifier outputs, and transcript of attempts.

**Visual semantics:** A valid signature carrying an extra symbol is **`VALID SIGNATURE — ADDITIONAL SIGNAL PRESENT`**, not an unconditional green security claim. Invalid signature = reject; arbitrary bit in an invalid signature is not a trusted decoded message. Color plus visible words/icons at all times.

### EDGE CASES (fail closed)

Malformed DER/P1363 or noncanonical encoding, zero or out-of-range scalar, wrong curve, wrong message, modified signature byte, test fixture with unsupported extra-entropy API, attempt cap reached, interrupted signing, output carrying ambiguous or mismatched bit. Never silently change the message to force a successful bit.

## §2 / Teaching & negative claim

**Opening:** Most signatures prove who authorized a set of bytes. Some signature methods allow more than one valid signature for those same bytes. The choice of *which* valid signature to publish can itself reveal a tiny, additional message.

**Negative claim (§4.1d):** “A signature passing verification does **not** mean the signature encoding carries no additional information.” In the fixture, both the ordinary verifier and an independent verifier accept a genuine ECDSA signature, **and** the decoder recovers the encoded one-bit symbol; a visibly paired warning must remain on screen. Mutation-testing the decoder or removing the warning must fail the owning claim test.

## TESTS / ACCEPTANCE

- RFC 6979 P-256/SHA-256 **published known-answer signatures**; be explicit about RFC vector conventions and low-`s` normalization. Do not pretend a library's preferred normalized output is byte-for-byte the original RFC vector if it differs legitimately; verify mathematically and state transformations.
- FIPS 186-5 ECDSA edge cases, sign/verify round-trips, genuine rejection for tampered message/bytes, canonical parse and cross-verification using WebCrypto.
- Pin deterministic tests: same key + message + deterministic settings = same output; fresh extra entropy can produce distinct valid signatures.
- Channel tests: actual `r`-bit decoder returns requested bit on successful bounded selection; every emitted candidate remains valid; capped exhaustion reports honestly. Use fixed test RNG inputs **only in tests**, not production key generation.
- `e2e/claims.spec.ts`: drive signature-valid/channel-present negative fixture, produce real tamper failures, retire stale verdicts on message/mode change and preserve on no-op; assert labels match actual bytes and independent verification.
- Source-level mutation proofs (§4.1c): corrupt verification accept, decoder `r` bit, or deterministic comparison and show owning tests catch each against a rebuilt bundle with a changed hash; remove the negative warning and require a failing test.
- Apply master template §§3–6: dark pinned theme/no toggle; `cl-topbar`, standardized hero/Why It Matters, scripture footer; WCAG 2.1 AA production-browser zero axe violations; README includes limitations; gated Actions deploy, unique Playwright port, grouped Dependabot with post-merge dispatch, catalog registries and served-byte verification. Report measured test counts.

## Primary references & related demos

- [FIPS 186-5](https://csrc.nist.gov/pubs/fips/186-5/final) · [RFC 6979](https://www.rfc-editor.org/rfc/rfc6979)
- [ECDSA Forge](https://systemslibrarian.github.io/crypto-lab-ecdsa-forge/) · [Schnorr Forge](https://systemslibrarian.github.io/crypto-lab-schnorr-forge/) · [Commit Gate](https://systemslibrarian.github.io/crypto-lab-commit-gate/)

**Ship criterion:** A visitor can see a real, **valid** ECDSA signature carrying one deliberately selected bit, inspect the signature bytes that encode it, and see precisely what deterministic signing changes—and what it does not.
