"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useSelector } from "react-redux";
import {
    startTestThunk,
    submitTestThunk,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    resetTestState,
} from "@/store/slices/takeTestSlice";
import { use } from "react";

// --------------------------------------------------
// Pagina principala pentru studentul care da testul
// --------------------------------------------------

export default function Page({ params }: any) {
    const { testId } = params;
    const dispatch = useDispatch<AppDispatch>();

    const {
        session,
        currentQuestionIndex,
        answers,
        result,
        loading,
        error,
    } = useSelector((state: RootState) => state.takeTest);

    // Pornim testul imediat ce pagina se incarca
    useEffect(() => {
        dispatch(startTestThunk(testId));
    }, [dispatch, testId]);

    // Daca inca se incarca
    if (loading && !session) {
        return <p className="text-center mt-10">Loading test...</p>;
    }

    // Daca exista eroare
    if (error) {
        return (
            <div className="text-center mt-10 text-red-600">
                <p>Error: {error}</p>
                <button
                    onClick={() => dispatch(startTestThunk(testId))}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Retry 
                </button>
            </div>
        );
    }

    // Daca testul este finalizat
    if (result) {
        return (
            <div className="max-w-xl mx-auto mt-10 text-center">
                <h2 className="text-2xl font-bold mb-4">Your Result</h2>
                <p className="text-lg mb-2">Score: {result.score}</p>
                <p className="text-lg mb-6">
                    Correct: {result.correctAnswers} / {result.totalQuestions}
                </p>

                <button 
                    onClick={() => dispatch(resetTestState())}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Back to course 
                </button>
            </div>
        );
    }

    // Daca nu avem sesiune inca
    if (!session)
    {
        return null;
    }
    const question = session.questions[currentQuestionIndex];

    // Functii pentru actiuni
    const handleSelectAnswer = (questionId: string, optionId: string) => {
        dispatch(selectAnswer({ questionId, optionId }));
    };

    const handleNext = () => dispatch(nextQuestion());
    const handlePrev = () => dispatch(prevQuestion());

    const handleSubmit = () => {
        if (!session) return;

        const payload = {
            answers: Object.entries(answers).map(([questionId, optionId]) => ({
                questionId,
                selectedOptionId: optionId,
            })),
        };

        dispatch(
            submitTestThunk({
                attemptId: session.attemptId,
                payload,
            })
        );
    };

    // --------------------------------------------------
    // UI principal
    // --------------------------------------------------

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center">
                {session.title}
            </h2>

            <div className="border rounded p-6 shadow">
                <p className="text-lg font-medium mb-4">
                    Question {currentQuestionIndex + 1} / {session.questions.length}
                </p>

                <p className="text-lg mb-6">{question.prompt}</p>

                <div className="space-y-3">
                    {question.options.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleSelectAnswer(String(question.questionId), String(opt.id))}
                            className={`block w-full text-left px-4 py-2 rounded border ${
                                answers[String(question.questionId)] === String(opt.id) 
                                ? "bg-green-500 text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        >
                            {opt.label}
                        </button> 
                    ))}
                </div>

                <div className="flex justify-between mt-6">
                    {currentQuestionIndex > 0 && (
                        <button 
                            onClick={handlePrev}
                            className="px-4 py-2 bg-gray-300 rounded"
                        >
                            Back 
                        </button>
                    )}

                    {currentQuestionIndex < session.questions.length - 1 ? (
                        <button 
                            onClick={handleNext}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Next  
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-green-600 text-white rounded"
                        >
                            Submit test 
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}