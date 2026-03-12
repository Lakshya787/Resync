import { Action } from "../models/action.model.js";
import { UserActiveStep } from "../models/userActiveStep.model.js";
import { generateAI } from "./gemini.service.js";

/* ======================================================
GENERATE FIRST ACTION
====================================================== */

export const generateFirstAction = async (
  userActiveStepId,
  learningStep,
  pacePreference
) => {

  const activeStep = await UserActiveStep
    .findById(userActiveStepId)
    .populate("step");

  if (!activeStep) {
    throw new Error("Active step not found");
  }

  /* pace based time */

  const paceMap = {
    slow: 60,
    medium: 90,
    fast: 120
  };

  const estimatedMinutes = paceMap[pacePreference] || 90;

  const prompt = `
Generate the FIRST daily action for this step.

Rules:
- one action only
- must be completable in one day
- no explanation
- JSON only

Format:
{
"title":"",
"description":""
}

Step:
${learningStep.title}

Description:
${learningStep.description}
`;

  const aiRaw = await generateAI(prompt);

  let parsed;

  try {
    parsed = JSON.parse(aiRaw);
  } catch {
    throw new Error("Invalid AI JSON");
  }

  const { title, description } = parsed;

  if (!title) {
    throw new Error("AI action incomplete");
  }

  const action = await Action.create({
    user: activeStep.user,
    userActiveStep: userActiveStepId,
    step: learningStep._id,
    title,
    description,
    sequence: 1,
    estimatedMinutes,
    minRequiredMinutes: Math.floor(estimatedMinutes * 0.8),
    status: "pending"
  });

  return action;
};



/* ======================================================
GENERATE NEXT ACTION
====================================================== */

export const generateNextAction = async (userActiveStepId) => {

  const activeStep = await UserActiveStep
    .findById(userActiveStepId)
    .populate("step");

  if (!activeStep) {
    throw new Error("Active step not found");
  }

  const previousActions = await Action
    .find({ userActiveStep: userActiveStepId })
    .sort({ sequence: 1 });

  const history = previousActions.map(a => a.title);

const nextActionPrompt = `
You are an expert learning coach generating structured daily tasks.

Your task is to generate the NEXT action for a learning step.

STEP
${activeStep.step.title}

STEP DESCRIPTION
${activeStep.step.description}

PREVIOUS ACTIONS
${JSON.stringify(history)}

ACTION RULES

1. Generate ONLY ONE action.
2. The action must move the learner closer to completing the step.
3. Do NOT repeat or rephrase previous actions.
4. The action must be clear, specific, and practical.
5. The action should be achievable in a single focused session.
6. Avoid vague instructions like "learn more", "study about", or "practice".

QUALITY GUIDELINES

- The title should clearly describe the task.
- The description should explain what exactly the learner will do.
- The action should feel like the next logical task after the previous actions.

OUTPUT RULES

- Return ONLY valid JSON
- No markdown
- No explanations
- No extra text

FORMAT
{
"title":"",
"description":""
}
`;

  const aiRaw = await generateAI(nextActionPrompt);

  let parsed;

  try {
    parsed = JSON.parse(aiRaw);
  } catch {
    throw new Error("Invalid AI JSON");
  }

  const { title, description } = parsed;

  if (!title) {
    throw new Error("AI action incomplete");
  }

  const nextSequence = previousActions.length + 1;

  const action = await Action.create({
    user: activeStep.user,
    userActiveStep: userActiveStepId,
    step: activeStep.step._id,
    title,
    description,
    sequence: nextSequence,
    estimatedMinutes: previousActions[0]?.estimatedMinutes || 90,
    minRequiredMinutes: 60,
    status: "pending"
  });

  return action;
};