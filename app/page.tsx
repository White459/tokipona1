"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Trash2, Edit, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Word {
  id: number
  word: string
  meaning: string
  english: string | null
  is_official: boolean
  example?: string | null
  created_at: string
}

export default function TokiPonaDictionary() {
  const [words, setWords] = useState<Word[]>([])
  const [filteredWords, setFilteredWords] = useState<Word[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOfficial, setFilterOfficial] = useState<"all" | "official" | "unofficial">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<Word | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    word: "",
    meaning: "",
    english: "",
    example: "",
    is_official: false,
  })

  useEffect(() => {
    loadWords()
  }, [])

  useEffect(() => {
    filterWords()
  }, [words, searchTerm, filterOfficial])

  async function loadWords() {
    try {
      const response = await fetch("/api/words")
      if (!response.ok) throw new Error("Failed to fetch words")
      const data = await response.json()
      setWords(data)
    } catch (error) {
      toast({
        title: "오류",
        description: "단어를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  function filterWords() {
    let filtered = words

    if (searchTerm) {
      filtered = filtered.filter(
        (word) =>
          word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          word.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (word.english && word.english.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (filterOfficial !== "all") {
      filtered = filtered.filter((word) => (filterOfficial === "official" ? word.is_official : !word.is_official))
    }

    setFilteredWords(filtered)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.word || !formData.meaning) {
      toast({
        title: "오류",
        description: "단어와 의미는 필수입니다.",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingWord ? `/api/words/${editingWord.id}` : "/api/words"
      const method = editingWord ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          english: formData.english || null,
          example: formData.example || null,
        }),
      })

      if (!response.ok) throw new Error("Failed to save word")

      toast({
        title: "성공",
        description: editingWord ? "단어가 수정되었습니다!" : "단어가 추가되었습니다!",
      })

      setFormData({ word: "", meaning: "", english: "", example: "", is_official: false })
      setIsAddDialogOpen(false)
      setEditingWord(null)
      loadWords()
    } catch (error) {
      toast({
        title: "오류",
        description: "단어 저장에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("이 단어를 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/words/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete word")

      toast({
        title: "성공",
        description: "단어가 삭제되었습니다.",
      })
      loadWords()
    } catch (error) {
      toast({
        title: "오류",
        description: "단어 삭제에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  function openEditDialog(word: Word) {
    setEditingWord(word)
    setFormData({
      word: word.word,
      meaning: word.meaning,
      english: word.english || "",
      example: word.example || "",
      is_official: word.is_official,
    })
    setIsAddDialogOpen(true)
  }

  function closeDialog() {
    setIsAddDialogOpen(false)
    setEditingWord(null)
    setFormData({ word: "", meaning: "", english: "", example: "", is_official: false })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <BookOpen className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">토키 포나 비공식 사전</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Toki Pona Unofficial Dictionary</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            총 {words.length}개의 단어 | {words.filter((w) => w.is_official).length}개 공식 단어
          </p>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="단어 검색... (Toki Pona, 한국어, English)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={filterOfficial} onValueChange={(v) => setFilterOfficial(v as any)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="official">공식</TabsTrigger>
              <TabsTrigger value="unofficial">비공식</TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                단어 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingWord ? "단어 수정" : "새 단어 추가"}</DialogTitle>
                <DialogDescription>토키 포나 단어를 {editingWord ? "수정" : "추가"}하세요.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="word">Toki Pona 단어 *</Label>
                  <Input
                    id="word"
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    placeholder="예: toki"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="meaning">의미 (한국어) *</Label>
                  <Input
                    id="meaning"
                    value={formData.meaning}
                    onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                    placeholder="예: 말하다, 언어"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="english">Meaning (English)</Label>
                  <Input
                    id="english"
                    value={formData.english}
                    onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                    placeholder="예: to speak, language"
                  />
                </div>
                <div>
                  <Label htmlFor="example">예문 (Example)</Label>
                  <Textarea
                    id="example"
                    value={formData.example}
                    onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                    placeholder="예: mi toki e toki pona (나는 토키 포나를 말한다)"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_official"
                    checked={formData.is_official}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_official: checked as boolean })}
                  />
                  <Label htmlFor="is_official" className="cursor-pointer">
                    공식 단어
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingWord ? "수정" : "추가"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    취소
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {filteredWords.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">
                {searchTerm || filterOfficial !== "all"
                  ? "검색 결과가 없습니다."
                  : "단어가 없습니다. 첫 번째 단어를 추가해보세요!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredWords.map((word) => (
              <Card key={word.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-indigo-600 dark:text-indigo-400">{word.word}</CardTitle>
                      {word.is_official && (
                        <Badge variant="default" className="mt-2 bg-green-500">
                          공식 단어
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(word)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(word.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">한국어:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{word.meaning}</span>
                  </div>
                  {word.english && (
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">English:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{word.english}</span>
                    </div>
                  )}
                  {word.example && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">예문:</span>
                      <p className="ml-2 text-gray-600 dark:text-gray-400 italic mt-1">{word.example}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Toaster />
    </div>
  )
}
