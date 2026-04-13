/**
 * Demo Data Module
 *
 * Provides realistic sample data for the Clinical Note Hallucination Detector.
 * Contains a doctor-patient transcript and a corresponding SOAP note that
 * intentionally includes hallucinated (ungrounded or partially grounded)
 * claims alongside accurate ones.
 *
 * DEMO_TRANSCRIPT: A ~40-line dialogue between Dr. Martinez and patient
 * Mrs. Chen discussing headaches, their characteristics, medications,
 * family history, lifestyle factors, and the clinical assessment/plan.
 *
 * DEMO_NOTE: A SOAP-format clinical note derived from the transcript with
 * 15 intentionally embedded hallucinations of varying severity (ungrounded
 * facts, inflated/deflated numbers, fabricated medications, reversed
 * diagnoses, etc.) mixed among many correctly grounded claims.
 *
 * Exports:
 *   - DEMO_TRANSCRIPT (string): The verbatim doctor-patient conversation.
 *   - DEMO_NOTE (string): The SOAP note containing hallucinations.
 */

/**
 * DEMO_TRANSCRIPT
 *
 * A realistic doctor-patient conversation between Dr. Martinez and Mrs. Chen.
 * The patient presents with right-sided headaches for approximately one week.
 * The transcript covers history of present illness, associated symptoms,
 * medications, family history, social/occupational stressors, sleep habits,
 * vitals, neurological exam findings, clinical assessment, and the plan.
 *
 * This transcript serves as the ground truth against which the SOAP note
 * is verified. Any claim in the note that cannot be traced back to this
 * transcript is considered a hallucination.
 *
 * Inputs: None (constant string).
 * Outputs: A multi-line string containing the full dialogue.
 */
export const DEMO_TRANSCRIPT = `Dr. Martinez: Good morning, Mrs. Chen. What brings you in today?

Mrs. Chen: Hi, Doctor. I've been having these really bad headaches for about a week now and they're not going away.

Dr. Martinez: I'm sorry to hear that. Can you tell me more about them? Where exactly do you feel the pain?

Mrs. Chen: It's on the right side, mostly behind my eye. It's a throbbing kind of pain.

Dr. Martinez: And when during the day do they tend to be the worst?

Mrs. Chen: They're definitely worse in the afternoon. By the time I get home from work, it's pretty unbearable.

Dr. Martinez: On a scale of zero to ten, how bad does the pain get at its worst?

Mrs. Chen: At its worst, I'd say it's a seven out of ten. But some days it's more like a four or five.

Dr. Martinez: Are there things that seem to make it worse?

Mrs. Chen: Yes, bright lights are terrible. And loud noises too. When it gets bad I just go to my dark bedroom and lie down.

Dr. Martinez: Have you been taking anything for the pain?

Mrs. Chen: I've been taking Tylenol. It helps a little bit, but it doesn't really get rid of it. I take it maybe two or three times a day.

Dr. Martinez: Any nausea or vomiting with the headaches?

Mrs. Chen: I do get a little nauseous sometimes, but I haven't thrown up.

Dr. Martinez: Any changes in your vision? Like seeing spots, flashing lights, or blurry vision?

Mrs. Chen: No, nothing like that. My vision has been fine.

Dr. Martinez: Does anyone in your family get headaches or migraines?

Mrs. Chen: My mom had migraines. She dealt with them for years.

Dr. Martinez: What medications are you currently taking?

Mrs. Chen: I take a blood pressure pill and a vitamin D supplement. That's it.

Dr. Martinez: Have you had any recent head injuries? Falls, bumps, anything like that?

Mrs. Chen: No, nothing like that.

Dr. Martinez: How have things been at work and at home? Any unusual stress?

Mrs. Chen: Work has been really stressful. There have been layoffs and I've been covering for two people. It's been overwhelming.

Dr. Martinez: And how has your sleep been?

Mrs. Chen: Not great. I'm only getting about five or six hours a night, and I keep waking up a lot.

Dr. Martinez: All right, let me get your vitals and do a quick exam. Your blood pressure is 138 over 88, pulse is 76, and temperature is 98.4. I'm going to do a brief neuro check now.

Mrs. Chen: Okay.

Dr. Martinez: Can you follow my finger with your eyes? Good. Now squeeze both my hands. Good, equal grip strength on both sides. Your pupils are equal and reactive. I'm going to look in the back of your eyes — no papilledema. Your neck is supple, no meningeal signs.

Mrs. Chen: So what do you think is going on?

Dr. Martinez: Based on everything you've told me and the exam, I think these are most likely tension-type headaches that are being made worse by your stress and poor sleep. But given your family history of migraines, I want to keep migraine on the differential as well.

Mrs. Chen: What should I do about them?

Dr. Martinez: I'd like you to try ibuprofen 400 milligrams instead of the Tylenol — it should work better for this type of headache. I also want you to work on sleep hygiene. Try to get a consistent bedtime, limit screens before bed, and aim for seven to eight hours. I'd like to see you back in three weeks, and if things aren't improving, we'll consider starting a preventive medication and getting an MRI to rule out anything else.

Mrs. Chen: That sounds good. Anything I should watch out for?

Dr. Martinez: Yes — if your headache gets suddenly much worse, if you develop any weakness, any changes in your vision, or if you get a fever, I want you to go to the emergency room right away. Don't wait for the follow-up.

Mrs. Chen: Okay, I will. Thank you, Doctor.

Dr. Martinez: You're welcome, Mrs. Chen. Take care.`;

/**
 * DEMO_NOTE
 *
 * A SOAP (Subjective, Objective, Assessment, Plan) clinical note generated
 * from DEMO_TRANSCRIPT. This note intentionally contains 15 hallucinations
 * of varying types embedded among many correctly grounded statements:
 *
 * Hallucinations included:
 *  1. "42-year-old female" — age never stated in transcript (ungrounded)
 *  2. Pain rated "8/10 at its worst" — patient said 7/10 (ungrounded)
 *  3. "Tylenol extra-strength 500mg" — patient only said "Tylenol" (partial)
 *  4. "lisinopril 10mg daily" — patient said "blood pressure pill" (ungrounded)
 *  5. "vitamin D 2000 IU daily" — patient said "vitamin D supplement" (partial)
 *  6. Sleep "4-5 hours per night" — patient said "5 or 6 hours" (ungrounded)
 *  7. "occasional neck stiffness" — never mentioned (ungrounded)
 *  8. "no cervical lymphadenopathy" — not mentioned in exam (ungrounded)
 *  9. "deep tendon reflexes 2+ and symmetric" — not mentioned (ungrounded)
 * 10. "appears fatigued" — not stated in transcript (ungrounded)
 * 11. Primary diagnosis "Migraine without aura" — doctor said tension-type
 *     headache as primary, migraine on differential (ungrounded / reversed)
 * 12. "ibuprofen 600mg" — doctor said 400mg (partial, drug right dose wrong)
 * 13. "sumatriptan 50mg as needed" — never discussed (ungrounded)
 * 14. "Follow-up in 2 weeks" — doctor said 3 weeks (ungrounded)
 * 15. "amitriptyline 25mg nightly" — doctor said "preventive medication"
 *     without naming a specific drug (ungrounded)
 *
 * Grounded claims are also present throughout to ensure the demo shows a
 * realistic mix of verified and hallucinated content.
 *
 * Inputs: None (constant string).
 * Outputs: A multi-line string containing the full SOAP note.
 */
export const DEMO_NOTE = `SUBJECTIVE:
Mrs. Chen is a 42-year-old female presenting with a chief complaint of headaches for approximately one week. She describes the pain as throbbing in quality, localized to the right side behind her eye. The headaches are worse in the afternoon, particularly after returning home from work. She rates the pain as 8/10 at its worst and 4-5/10 on better days. Aggravating factors include bright lights and loud noises; she reports retreating to a dark bedroom when symptoms are severe. She has been self-medicating with Tylenol extra-strength 500mg, taking it two to three times daily with minimal relief. She reports some nausea but denies vomiting. She denies any visual changes including scotomata, photopsia, or blurred vision. She also reports occasional neck stiffness.

Family history is significant for migraines in her mother.

Current medications include lisinopril 10mg daily for hypertension and vitamin D 2000 IU daily. She denies any recent head trauma or injury.

Social history reveals significant occupational stress — recent layoffs at work with the patient covering responsibilities for two people. She reports sleeping only 4-5 hours per night with frequent awakenings.

OBJECTIVE:
Vitals: BP 138/88 mmHg, HR 76 bpm, Temp 98.4°F. Patient appears fatigued.

Neurological examination:
- Extraocular movements intact, smooth pursuit tracking normal
- Grip strength equal bilaterally
- Pupils equal, round, and reactive to light
- Fundoscopic exam: no papilledema noted
- Neck supple, no meningeal signs
- No cervical lymphadenopathy
- Deep tendon reflexes 2+ and symmetric

ASSESSMENT:
1. Migraine without aura — likely primary diagnosis given right-sided throbbing headache with photophobia, phonophobia, nausea, and positive family history of migraines in mother
2. Elevated blood pressure — 138/88, may be contributing to headache symptoms
3. Insomnia and occupational stress — contributing to and exacerbating headache pattern

PLAN:
1. Start ibuprofen 600mg every 6-8 hours as needed for headache, discontinue Tylenol
2. Prescribe sumatriptan 50mg as needed for acute migraine episodes, maximum 2 doses per 24 hours
3. Start amitriptyline 25mg nightly as headache prophylaxis
4. Sleep hygiene counseling: establish consistent bedtime, reduce screen exposure before sleep, target 7-8 hours per night
5. Follow-up in 2 weeks to reassess symptoms; if no improvement, will order MRI brain to rule out structural pathology
6. Return precautions: patient instructed to go to the emergency room immediately if she experiences sudden severe headache, new weakness, vision changes, or fever`;
