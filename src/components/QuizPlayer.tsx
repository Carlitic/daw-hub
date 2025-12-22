/**
 * QuizPlayer.tsx
 * 
 * PROPÓSITO:
 * Motor para realizar los exámenes tipo test dentro de la aplicación.
 * 
 * FUNCIONAMIENTO:
 * - Recibe una lista de preguntas (questions) donde cada una tiene opciones y el índice de la correcta.
 * - Muestra una pregunta a la vez.
 * - Permite seleccionar respuesta, comprobar si está bien (feedback inmediato) y pasar a la siguiente.
 * - Al final muestra una pantalla de resumen con la nota.
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

type Question = {
    q: string
    options: string[]
    correct: number
}

interface QuizPlayerProps {
    questions: Question[]
    onComplete: (data: any) => void
}

export function QuizPlayer({ questions, onComplete }: QuizPlayerProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [score, setScore] = useState(0)
    const [showResults, setShowResults] = useState(false)

    if (!questions || questions.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No hay preguntas disponibles en este test.</p>
            </div>
        )
    }

    const handleCheck = () => {
        if (selectedAnswer === null) return

        const isCorrect = selectedAnswer === questions[currentQuestion].correct
        if (isCorrect) setScore(s => s + 1)
        setIsAnswered(true)
    }

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1)
            setSelectedAnswer(null)
            setIsAnswered(false)
        } else {
            setShowResults(true)
            onComplete({ score: score + (questions[currentQuestion].correct === selectedAnswer ? 1 : 0), total: questions.length })
        }
    }

    const handleRetry = () => {
        setCurrentQuestion(0)
        setSelectedAnswer(null)
        setIsAnswered(false)
        setScore(0)
        setShowResults(false)
    }

    if (showResults) {
        const grade = (score / questions.length) * 10
        const formattedGrade = grade % 1 === 0 ? grade.toFixed(0) : grade.toFixed(1) // 8 or 8.5

        let message = "¡Buen trabajo!"
        let color = "text-green-500"

        if (grade < 5) {
            message = "Necesitas repasar..."
            color = "text-red-500"
        } else if (grade >= 9) {
            message = "¡Sobresaliente!"
            color = "text-purple-500"
        }

        return (
            <Card className="max-w-xl mx-auto text-center py-8 animate-in zoom-in-50 duration-500">
                <CardHeader>
                    <CardTitle className="text-3xl">Resultados del Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Nota Final</span>
                        <div className={`text-7xl font-black ${color}`}>
                            {formattedGrade} <span className="text-2xl text-muted-foreground font-medium">/ 10</span>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <p className="font-medium text-lg">{message}</p>
                        <p className="text-muted-foreground text-sm mt-1">
                            Has acertado <span className="font-bold text-foreground">{score}</span> de <span className="font-bold text-foreground">{questions.length}</span> preguntas.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="justify-center gap-4">
                    <Button onClick={handleRetry} className="w-full sm:w-auto">
                        <RotateCcw className="mr-2 h-4 w-4" /> Repetir Test
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    const q = questions[currentQuestion]

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Pregunta {currentQuestion + 1} de {questions.length}</span>
                    <span className="text-sm font-medium">Puntuación: {score}</span>
                </div>
                <CardTitle>{q.q}</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup value={selectedAnswer?.toString()} onValueChange={(v) => !isAnswered && setSelectedAnswer(parseInt(v))}>
                    {q.options.map((option, index) => (
                        <div key={index} className={cn(
                            "flex items-center space-x-2 border p-4 rounded-lg transition-colors",
                            selectedAnswer === index && "border-primary bg-primary/5",
                            isAnswered && index === q.correct && "border-green-500 bg-green-500/10",
                            isAnswered && selectedAnswer === index && selectedAnswer !== q.correct && "border-destructive bg-destructive/10"
                        )}>
                            <RadioGroupItem value={index.toString()} id={`opt-${index}`} disabled={isAnswered} />
                            <Label htmlFor={`opt-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                            {isAnswered && index === q.correct && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {isAnswered && selectedAnswer === index && selectedAnswer !== q.correct && <XCircle className="h-5 w-5 text-destructive" />}
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
            <CardFooter className="justify-end">
                {!isAnswered ? (
                    <Button onClick={handleCheck} disabled={selectedAnswer === null}>Comprobar</Button>
                ) : (
                    <Button onClick={handleNext}>{currentQuestion === questions.length - 1 ? "Ver Resultados" : "Siguiente Pregunta"}</Button>
                )}
            </CardFooter>
        </Card>
    )
}
