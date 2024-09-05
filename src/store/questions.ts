import confetti from 'canvas-confetti';
import { type Question } from '../types';
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware'

interface State {
    questions: Question[]
    currentQuestion: number
    fetchQuestions: (limit: number) => Promise<void>
    selectAnswer: (questionId: number, answerIndex: number) => void
    goNextQuestion: () => void
    goPreviousQuestion: () => void
    reset: () => void
  }
  
  
  export const useQuestionsStore = create<State>()(devtools(persist((set, get) => {
    return {
      loading: false,
      questions: [],
      currentQuestion: 0,
  
      fetchQuestions: async (limit: number) => {
        const res = await fetch(`http://localhost:5173//data.json`)
        const json = await res.json()
  
        const questions = json.sort(() => Math.random() - 0.5).slice(0, limit)
        set({ questions }, false, 'FETCH_QUESTIONS')
      },
  

        selectAnswer: (questionId:number, answerIndex:number) =>{
            const {questions}= get()
            // usando estructuredClone que sirve para clonar el objeto de forma profunda
            const newQuestions= structuredClone(questions)
            //encontrar el indice de la pregunta
            const questionIndex= newQuestions.findIndex(q => q.id === questionId)
            //obtener info de la pregunta
            const questionInfo= newQuestions[questionIndex]
            //ver si el user ha seleccionado la correcta
            const isCorrectUserAnswer= questionInfo.correctAnswer === answerIndex
            if(isCorrectUserAnswer) confetti()
            //cambiar esa info en la copia de la pregunta
            newQuestions[questionIndex] = {
                ...questionInfo,
                isCorrectUserAnswer,
                userSelectedAnswer: answerIndex
            }
            // actualizar el estado
            set({ questions: newQuestions }, false, 'SELECT_ANSWER')
        },
        goNextQuestion: ()=>{
            const {currentQuestion, questions } =get()
            const nextQuestion = currentQuestion + 1 

            if(nextQuestion < questions.length){
                set({ currentQuestion: nextQuestion }, false, 'GO_NEXT_QUESTION')
            }
        },
        goPreviousQuestion: ()=>{
            const {currentQuestion} =get()
            const previousQuestion= currentQuestion - 1

            if(previousQuestion >= 0 ) {
                set({ currentQuestion: previousQuestion }, false, 'GO_PREVIOUS_QUESTION')
            }
        },
        reset: () => {
            set({ currentQuestion: 0, questions: [] }, false, 'RESET')
          }
        }
      }, {
        name: 'questions'
      })))