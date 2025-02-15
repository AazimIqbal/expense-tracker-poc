"use client"

import { useState, useEffect } from "react"
import { db, auth } from "@/app/firebase"
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PlusCircle, BarChart3, DollarSign, Calendar, Trash2, Edit2 } from "lucide-react"

export default function ExpenseTracker() {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Food")
  const [expenses, setExpenses] = useState<any[]>([])
  const [editingExpense, setEditingExpense] = useState<any | null>(null)
  const [filterCategory, setFilterCategory] = useState("All")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [user] = useAuthState(auth)

  const categories = ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Others"]

  useEffect(() => {
    if (user) {
      fetchExpenses()
    }
  }, [user])

  const addExpense = async () => {
    if (!user || !amount) return
    await addDoc(collection(db, "expenses"), {
      uid: user.uid,
      amount: Number.parseFloat(amount),
      category,
      description: description || "",
      timestamp: new Date().toISOString(),
    })
    setAmount("")
    setDescription("")
    setCategory("Food")
    fetchExpenses()
  }

  const fetchExpenses = async () => {
    if (!user) return
    const q = query(collection(db, "expenses"), where("uid", "==", user.uid))
    const querySnapshot = await getDocs(q)
    setExpenses(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
  }

  const deleteExpense = async (id: string) => {
    await deleteDoc(doc(db, "expenses", id))
    setExpenses(expenses.filter((exp) => exp.id !== id))
  }

  const startEditing = (expense: any) => {
    setEditingExpense(expense)
  }

  const updateExpense = async () => {
    if (!editingExpense) return
    await updateDoc(doc(db, "expenses", editingExpense.id), {
      amount: Number.parseFloat(editingExpense.amount),
      description: editingExpense.description || "",
      category: editingExpense.category,
    })
    setEditingExpense(null)
    fetchExpenses()
  }

  const filteredExpenses =
    filterCategory === "All" ? expenses : expenses.filter((exp) => exp.category === filterCategory)

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <>
      {user && (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Expense Tracker</h1>
        </div>
        <nav className="mt-6">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("dashboard")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "add" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("add")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Number of Expenses</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{expenses.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Expense Date</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {expenses.length > 0 ? new Date(expenses[0].timestamp).toLocaleDateString() : "N/A"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Expense List</CardTitle>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="category-filter">Filter by Category:</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger id="category-filter">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount ($)</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((exp) => (
                      <TableRow key={exp.id}>
                        <TableCell>{exp.amount}</TableCell>
                        <TableCell>{exp.category}</TableCell>
                        <TableCell>{new Date(exp.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{exp.description || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => startEditing(exp)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Expense</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-amount" className="text-right">
                                      Amount
                                    </Label>
                                    <Input
                                      id="edit-amount"
                                      type="number"
                                      value={editingExpense?.amount}
                                      onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-category" className="text-right">
                                      Category
                                    </Label>
                                    <Select
                                      value={editingExpense?.category}
                                      onValueChange={(value) =>
                                        setEditingExpense({ ...editingExpense, category: value })
                                      }
                                    >
                                      <SelectTrigger id="edit-category" className="col-span-3">
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map((cat) => (
                                          <SelectItem key={cat} value={cat}>
                                            {cat}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-description" className="text-right">
                                      Description
                                    </Label>
                                    <Input
                                      id="edit-description"
                                      value={editingExpense?.description}
                                      onChange={(e) =>
                                        setEditingExpense({ ...editingExpense, description: e.target.value })
                                      }
                                      className="col-span-3"
                                    />
                                  </div>
                                </div>
                                <Button onClick={updateExpense}>Save Changes</Button>
                              </DialogContent>
                            </Dialog>
                            <Button variant="destructive" size="icon" onClick={() => deleteExpense(exp.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "add" && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  addExpense()
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
                <Button type="submit">Add Expense</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
      )}
      </>    
  )
}


