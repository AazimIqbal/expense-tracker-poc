import Auth from "@/app/components/Auth";
import ExpenseTracker from "@/app/components/ExpenseTracker";


export default function Home() {
  return (
    <div className="flex flex-col items-center h-screen w-screen bg-slate-600 p-4">
      <h1 className="text-2xl font-bold my-4">Expense Tracker</h1>
      <Auth />
      <ExpenseTracker />
    </div>
  );
} 