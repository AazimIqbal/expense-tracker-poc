"use client";
import { useState } from "react";
import { db, auth } from "@/app/firebase";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function ExpenseTracker() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showExpenses, setShowExpenses] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [user] = useAuthState(auth);

  const categories = ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Others"];

  const addExpense = async () => {
    if (!user || !amount) return;
    await addDoc(collection(db, "expenses"), {
      uid: user.uid,
      amount: parseFloat(amount),
      category,
      description: description || "",
      timestamp: new Date().toISOString(),
    });
    setAmount("");
    setDescription("");
    setCategory("Food");
    fetchExpenses();
  };

  const fetchExpenses = async () => {
    if (!user) return;
    const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    setExpenses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setShowExpenses(true);
  };

  const deleteExpense = async (id: string) => {
    await deleteDoc(doc(db, "expenses", id));
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const startEditing = (expense: any) => {
    setEditingExpense(expense);
  };

  const updateExpense = async () => {
    if (!editingExpense) return;
    await updateDoc(doc(db, "expenses", editingExpense.id), {
      amount: parseFloat(editingExpense.amount),
      description: editingExpense.description || "",
      category: editingExpense.category,
    });
    setEditingExpense(null);
    fetchExpenses();
  };

  const filteredExpenses = filterCategory === "All" 
    ? expenses 
    : expenses.filter(exp => exp.category === filterCategory);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-black text-center mb-4">Expense Tracker</h2>

      {user && (
        <>
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">Amount ($)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                type="number"
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded-lg p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">Description (Optional)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={addExpense} 
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Add Expense
              </button>
              {!showExpenses && (
                <button 
                  onClick={fetchExpenses} 
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Load Expenses
                </button>
              )}
            </div>
          </div>

          {showExpenses && (
            <div className="fixed inset-0 flex items-center justify-center text-black bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <h3 className="text-xl font-bold mb-4 text-center">Your Expenses</h3>

                {/* Filter Dropdown */}
                <div className="mb-4">
                  <label className="text-gray-700 font-medium mr-2">Filter by Category:</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="All">All</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100 text-black">
                        <th className="border p-2">Amount ($)</th>
                        <th className="border p-2">Category</th>
                        <th className="border p-2">Date & Time</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map(exp => (
                        <tr key={exp.id} className="text-center">
                          <td className="border p-2">{exp.amount}</td>
                          <td className="border p-2">{exp.category}</td>
                          <td className="border p-2">{new Date(exp.timestamp).toLocaleString()}</td>
                          <td className="border p-2">{exp.description || "N/A"}</td>
                          <td className="border p-2 space-x-2">
                            <button
                              onClick={() => startEditing(exp)}
                              className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteExpense(exp.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setShowExpenses(false)} 
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
