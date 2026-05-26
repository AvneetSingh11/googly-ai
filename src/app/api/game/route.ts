import { NextResponse } from 'next/server';
import { queryGemini } from '@/ai/gemini-client';
import {
  buildSystemPrompt,
  buildConversationHistory,
  buildUserMessage,
} from '@/ai/prompts';
import { getDatasetContext } from '@/game-engine/dataset';
import {
  createGame,
  getGame,
  getGameTurns,
  addTurn,
  updateGame,
} from '@/firebase/firestore';
import type { Turn, GameCategory, Answer, Game, GameState, PersonaMode } from '@/types/game';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      gameId,
      category,
      answer,
      questionNumber,
      conversationHistory,
    } = body;

    if (!gameId || !category) {
      return NextResponse.json(
        { error: 'Missing gameId or category' },
        { status: 400 }
      );
    }

    const datasetContext = getDatasetContext(category as GameCategory);

    // ─────────────────────────────────────────────────────────────────────────
    // ACTION: START GAME
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'start') {
      const initialTurns: Turn[] = [];
      const currentTurnNumber = 1;

      // 1. Build prompt and context for Gemini
      const systemPrompt =
        buildSystemPrompt(category as GameCategory, initialTurns, currentTurnNumber) +
        '\n' +
        datasetContext;

      const userMsg = buildUserMessage(undefined, currentTurnNumber, category as GameCategory);
      
      // 2. Query Gemini for the first question (or use Mock AI if no key)
      let response: any;
      if (process.env.GEMINI_API_KEY) {
        const geminiHistory = [
          {
            role: 'user' as const,
            parts: [{ text: userMsg }],
          },
        ];
        response = await queryGemini(systemPrompt, geminiHistory);
      } else {
        // MOCK AI FALLBACK
        response = {
          question: category === 'player' ? "Mock Q1: Let's begin! Is the player Indian?" : category === 'team' ? "Mock Q1: Let's begin! Is the team currently active?" : "Mock Q1: Let's begin! Did this match happen after 2015?",
          intent: "origin",
          confidence: 10,
          personaMode: "analyst" as PersonaMode,
          reasoning: "Mock mode initialized.",
          isGuess: false,
          guess: null
        };
      }

      // 3. Try to save initial game and first turn to Firestore
      try {
        const gameData: Game = {
          id: gameId,
          userId: 'anonymous_player',
          category: category as GameCategory,
          state: 'in_progress',
          turns: [],
          currentTurn: 1,
          maxTurns: 15,
          finalGuess: null,
          finalGuessCorrect: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          completedAt: null,
        };

        await createGame(gameData);

        const firstTurn: Turn = {
          turnNumber: 1,
          question: response.question,
          answer: 'dont_know', // Placeholder until user answers
          intent: response.intent,
          confidence: response.confidence,
          personaMode: response.personaMode,
          reasoning: response.reasoning,
          timestamp: Date.now(),
        };

        await addTurn(gameId, firstTurn);
      } catch (dbError) {
        console.warn('[API/Game] Firestore database not available or failed:', dbError);
      }

      return NextResponse.json(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ACTION: SUBMIT ANSWER & GET NEXT QUESTION
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'answer') {
      if (answer === undefined || questionNumber === undefined) {
        return NextResponse.json(
          { error: 'Missing answer or questionNumber' },
          { status: 400 }
        );
      }

      let turns: Turn[] = [];

      // 1. Fetch turns from Firestore
      try {
        turns = await getGameTurns(gameId);
      } catch (dbError) {
        console.warn('[API/Game] Firestore getGameTurns failed, falling back to client history:', dbError);
      }

      // 2. Stateless Fallback: Reconstruct turns from client-side conversationHistory if Firestore is empty
      if (turns.length === 0 && conversationHistory && conversationHistory.length >= 2) {
        for (let i = 0; i < conversationHistory.length; i += 2) {
          const assistantMsg = conversationHistory[i];
          const userMsg = conversationHistory[i + 1];

          if (
            assistantMsg &&
            assistantMsg.role === 'assistant' &&
            userMsg &&
            userMsg.role === 'user'
          ) {
            const turnNum = Math.floor(i / 2) + 1;
            const ans: Answer =
              userMsg.content === 'Yes'
                ? 'yes'
                : userMsg.content === 'No'
                ? 'no'
                : 'dont_know';

            turns.push({
              turnNumber: turnNum,
              question: assistantMsg.content,
              answer: ans,
              intent: 'reconstructed',
              confidence: 50,
              personaMode: 'analyst',
              reasoning: 'reconstructed',
              timestamp: Date.now(),
            });
          }
        }
      }

      // 3. Update the answered turn with the user's answer
      const answeredTurn = turns.find((t) => t.turnNumber === questionNumber);
      if (answeredTurn) {
        answeredTurn.answer = answer as Answer;
        try {
          await addTurn(gameId, answeredTurn); // Update turn in Firestore
        } catch (dbError) {
          console.warn('[API/Game] Firestore update turn failed:', dbError);
        }
      } else {
        // If not found (e.g. state sync issue in stateless fallback), push it as a reconstructed turn
        const newTurn: Turn = {
          turnNumber: questionNumber,
          question: conversationHistory[conversationHistory.length - 2]?.content || '',
          answer: answer as Answer,
          intent: 'reconstructed',
          confidence: 50,
          personaMode: 'analyst',
          reasoning: 'reconstructed',
          timestamp: Date.now(),
        };
        turns.push(newTurn);
        try {
          await addTurn(gameId, newTurn);
        } catch (dbError) {
          // ignore db failures in fallback mode
        }
      }

      // 4. Determine next turn number and config
      const nextTurnNumber = questionNumber + 1;
      const systemPrompt =
        buildSystemPrompt(category as GameCategory, turns, nextTurnNumber) +
        '\n' +
        datasetContext;

      // 5. Build conversation history and query Gemini (or use Mock AI)
      const geminiHistory = buildConversationHistory(turns, category as GameCategory);
      const userMsg = buildUserMessage(answer, nextTurnNumber, category as GameCategory);
      geminiHistory.push({
        role: 'user' as const,
        parts: [{ text: userMsg }],
      });

      let response: any;
      if (process.env.GEMINI_API_KEY) {
        response = await queryGemini(systemPrompt, geminiHistory);
      } else {
        // MOCK AI FALLBACK
        const isFinal = nextTurnNumber >= 15;
        
        let mockQuestions: string[];
        if (category === 'player') {
          mockQuestions = [
            "Let's begin! Is the player Indian?",
            "Are they a batsman?",
            "Have they captained a franchise?",
            "Did they play in the inaugural 2008 season?",
            "Are they known for hitting big sixes?",
            "Have they ever scored a century in the IPL?",
            "Do they bowl spin?",
            "Are they an overseas player?",
            "Have they won an Orange or Purple Cap?",
            "Is this player still active in the IPL?",
            "Have they played for Mumbai Indians?",
            "Are they a wicket-keeper?",
            "Did they take a hat-trick?",
            "Have they been involved in any major controversies?",
            "Are they known for a specific celebration?"
          ];
        } else if (category === 'team') {
          mockQuestions = [
            "Let's begin! Is the team currently active?",
            "Have they ever won an IPL trophy?",
            "Are they based in a coastal city?",
            "Is their primary jersey color blue?",
            "Have they ever changed their team name?",
            "Do they have a rivalry with CSK?",
            "Are they from North India?",
            "Did they debut after 2010?",
            "Are they known for relying heavily on overseas players?",
            "Have they ever finished at the bottom of the table?",
            "Has MS Dhoni ever played for them?",
            "Are they owned by a Bollywood celebrity?",
            "Is their home ground known for a high-scoring pitch?",
            "Have they made it to the playoffs more than 5 times?",
            "Did they ever win back-to-back titles?"
          ];
        } else {
          mockQuestions = [
            "Let's begin! Did this match happen after 2015?",
            "Was this an IPL Final?",
            "Did the match go to a Super Over?",
            "Was a century scored in this match?",
            "Did Chennai Super Kings play in this match?",
            "Was it a high-scoring chase (200+)?",
            "Did a bowler take 5 wickets in this match?",
            "Was there a major umpiring controversy?",
            "Did Virat Kohli play a significant role?",
            "Was this match played in Wankhede Stadium?",
            "Did a team collapse for less than 100 runs?",
            "Was it a rain-affected match?",
            "Did the match end with a six off the last ball?",
            "Was a hat-trick taken in this match?",
            "Is this match famous for a specific individual performance?"
          ];
        }

        const questionText = mockQuestions[(nextTurnNumber - 1) % mockQuestions.length];
        response = {
          question: isFinal ? "I know exactly who this is!" : `Mock Q${nextTurnNumber}: ${questionText}`,
          intent: "mock_progress",
          confidence: isFinal ? 99 : Math.min(80, nextTurnNumber * 10),
          personaMode: (isFinal ? "dramatic" : "entertainer") as PersonaMode,
          reasoning: "Mocking next turn.",
          isGuess: isFinal,
          guess: isFinal ? (category === 'player' ? 'MS Dhoni' : category === 'team' ? 'Mumbai Indians' : '2019 IPL Final') : null
        };
      }

      // 6. Save the new question as an incomplete turn in Firestore, and update overall game state
      try {
        const nextTurn: Turn = {
          turnNumber: nextTurnNumber,
          question: response.question,
          answer: 'dont_know', // Placeholder
          intent: response.intent,
          confidence: response.confidence,
          personaMode: response.personaMode,
          reasoning: response.reasoning,
          timestamp: Date.now(),
        };

        await addTurn(gameId, nextTurn);

        const gameStateUpdates: Partial<Game> = {
          currentTurn: nextTurnNumber,
          state: response.isGuess ? 'guessing' : 'in_progress',
          finalGuess: response.isGuess ? response.guess : null,
          updatedAt: Date.now(),
        };
        await updateGame(gameId, gameStateUpdates);
      } catch (dbError) {
        console.warn('[API/Game] Firestore write next turn failed:', dbError);
      }

      return NextResponse.json(response);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[API/Game] Error in route:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
