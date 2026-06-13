// "use client";

// import Link from "next/link";
// import { Lock, Mail, RefreshCw, Shield, ShieldCheck, Users, Zap } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";
// import { Navbar } from "@/components/layout/Navbar";
// import { Button } from "@/components/ui/Button";

// const features = [
//   { icon: Lock,       title: "JWT + Refresh Tokens",    desc: "Access tokens in memory, HttpOnly refresh cookies, silent rotation." },
//   { icon: Mail,       title: "OTP Email Verification",  desc: "6-digit codes via Gmail SMTP. Forgot password and reset flows included." },
//   { icon: Zap,        title: "Google OAuth2",           desc: "Social login wired up. Session restores silently on page load." },
//   { icon: Shield,     title: "Role-based Access",       desc: "ROLE_USER and ROLE_ADMIN. Middleware + page guards on every route." },
//   { icon: Users,      title: "Admin Panel",             desc: "Paginated user directory, role assignment, enable/disable accounts." },
//   { icon: RefreshCw,  title: "Token Rotation",          desc: "Refresh tokens rotate on every use. Expired tokens cleaned up nightly." },
// ];

// export default function HomePage() {
//   const { user, status } = useAuth();

//   return (
//     <div className="min-h-screen bg-white">
//       <Navbar />

//       {/* Hero */}
//       <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
//         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-6">
//           <ShieldCheck size={12} />
//           Production-ready auth starter
//         </div>

//         <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
//           Authentication,{" "}
//           <span className="text-indigo-600">done right.</span>
//         </h1>

//         <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
//           A complete auth system with JWT, OTP verification, OAuth2, RBAC, and admin panel.
//           Clone it and start building your product.
//         </p>

//         {status === "loading" ? (
//           <div className="h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
//         ) : user ? (
//           <Link href="/dashboard">
//             <Button size="lg">Go to Dashboard</Button>
//           </Link>
//         ) : (
//           <div className="flex items-center justify-center gap-3 flex-wrap">
//             <Link href="/register"><Button size="lg">Get started free</Button></Link>
//             <Link href="/login"><Button variant="secondary" size="lg">Sign in</Button></Link>
//           </div>
//         )}

//         <p className="mt-5 text-xs text-gray-400">
//           Spring Boot 4 · Next.js 16 · MySQL · Redis · Docker
//         </p>
//       </section>

//       {/* Features */}
//       <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {features.map(({ icon: Icon, title, desc }) => (
//             <div key={title} className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
//               <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 mb-3">
//                 <Icon size={16} />
//               </div>
//               <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
//               <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-gray-200 bg-white">
//         <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
//               <ShieldCheck size={12} />
//             </div>
//             <span className="text-sm font-bold text-gray-900">ERP System</span>
//           </div>
//           <div className="flex gap-5">
//             {[["Sign in", "/login"], ["Register", "/register"], ["Admin", "/admin"]].map(([label, href]) => (
//               <Link key={href} href={href} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
//                 {label}
//               </Link>
//             ))}
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }


// "use client";
// import Link from "next/link";
// import { 
//   Package, 
//   ShoppingCart, 
//   Truck, 
//   Factory, 
//   Layers, 
//   BarChart3, 
//   ShieldCheck 
// } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";
// import { Navbar } from "@/components/layout/Navbar";
// import { Button } from "@/components/ui/Button";

// const features = [
//   {
//     icon: Package,
//     title: "Product Management",
//     desc: "Manage products, categories, pricing, and inventory information."
//   },
//   {
//     icon: ShoppingCart,
//     title: "Sales Management",
//     desc: "Create and manage customer orders with stock availability checks."
//   },
//   {
//     icon: Truck,
//     title: "Purchase Management",
//     desc: "Manage vendors, purchase orders, and procurement processes."
//   },
//   {
//     icon: Factory,
//     title: "Manufacturing",
//     desc: "Track production orders and manufacturing workflows."
//   },
//   {
//     icon: Layers,
//     title: "Bill of Materials",
//     desc: "Define raw materials, components, and production requirements."
//   },
//   {
//     icon: BarChart3,
//     title: "Inventory & Analytics",
//     desc: "Monitor stock movements, inventory levels, and business performance."
//   }
// ];

// export default function HomePage() {
//   const { user, status } = useAuth();

//   return (
//     <div className="min-h-screen bg-white">
//       <Navbar />

//       {/* Hero Section */}
//       <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
//         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-sm font-medium text-emerald-700 mb-6">
//           <ShieldCheck size={16} />
//           Mini ERP — From Demand to Delivery
//         </div>

//         <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
//   Smart & Connected{" "}
//   <span className="text-emerald-600">ERP System</span>
// </h1>

//         <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
//   A unified Enterprise Resource Planning platform that connects Product
//   Management, Sales, Purchasing, Manufacturing, Inventory, and Procurement
//   into one seamless business workflow.
// </p>

//         {status === "loading" ? (
//           <div className="h-5 w-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
//         ) : user ? (
//           <Link href="/dashboard">
//             <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
//               Go to Dashboard
//             </Button>
//           </Link>
//         ) : (
//           <div className="flex items-center justify-center gap-4 flex-wrap">
//             <Link href="/register">
//               <Button size="lg">Get Started Free</Button>
//             </Link>
//             <Link href="/login">
//               <Button variant="secondary" size="lg">Sign In</Button>
//             </Link>
//           </div>
//         )}

//         <p className="mt-8 text-sm text-gray-500">
//           Built for Shiv Furniture Works • Next.js 16 • Spring Boot • Real-time Inventory
//         </p>
//       </section>

//       {/* Features Section */}
//       <section className="bg-gray-50 py-20">
//         <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold text-gray-900 mb-4">
//               Everything Your Manufacturing Business Needs
//             </h2>
//             <p className="text-gray-600 max-w-md mx-auto">
//               From customer order to finished product delivery — all in one connected system.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {features.map(({ icon: Icon, title, desc }) => (
//               <div 
//                 key={title} 
//                 className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-200 hover:shadow-md transition-all duration-300"
//               >
//                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-6">
//                   <Icon size={28} />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
//                 <p className="text-gray-600 leading-relaxed">{desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Business Problem & Goal */}
//       <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20">
//         <div className="grid md:grid-cols-2 gap-12 items-center">
//           <div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-6">The Challenge</h2>
//             <div className="space-y-4 text-gray-600">
//               <p>ERP Works was struggling with:</p>
//               <ul className="space-y-3">
//                 <li className="flex gap-3">❌ Sales without stock visibility</li>
//                 <li className="flex gap-3">❌ Manual purchase requests</li>
//                 <li className="flex gap-3">❌ Paper-based manufacturing</li>
//                 <li className="flex gap-3">❌ No accurate inventory tracking</li>
//               </ul>
//             </div>
//           </div>

//           <div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Solution</h2>
//             <div className="space-y-4 text-gray-600">
//               <p>A centralized Mini ERP that delivers:</p>
//               <ul className="space-y-3">
//                 <li className="flex gap-3">✅ Real-time stock visibility</li>
//                 <li className="flex gap-3">✅ Automated procurement</li>
//                 <li className="flex gap-3">✅ Full manufacturing tracking</li>
//                 <li className="flex gap-3">✅ End-to-end traceability</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-gray-200 bg-white py-8">
//         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="h-8 w-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
//               <Factory size={20} />
//             </div>
//            <span className="font-bold text-xl">Mini ERP System</span>
//           </div>
          
//           <div className="flex gap-6 text-sm text-gray-500">
//             <Link href="/login" className="hover:text-gray-900">Sign In</Link>
//             <Link href="/register" className="hover:text-gray-900">Register</Link>
//             <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }



"use client";

import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Truck,
  Factory,
  Layers,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";

const features = [
  {
    icon: Package,
    title: "Product Management",
    desc: "Manage products, categories, pricing, stock levels, and product lifecycle information.",
  },
  {
    icon: ShoppingCart,
    title: "Sales Management",
    desc: "Create sales orders, track order status, and verify stock availability in real time.",
  },
  {
    icon: Truck,
    title: "Purchase Management",
    desc: "Manage suppliers, purchase orders, approvals, and procurement workflows.",
  },
  {
    icon: Factory,
    title: "Manufacturing",
    desc: "Plan and execute production orders while tracking manufacturing progress.",
  },
  {
    icon: Layers,
    title: "Bill of Materials (BoM)",
    desc: "Define raw materials, components, and production requirements for products.",
  },
  {
    icon: BarChart3,
    title: "Inventory & Analytics",
    desc: "Monitor inventory movements, stock valuation, and business performance metrics.",
  },
];

export default function HomePage() {
  const { user, status } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-emerald-100 text-sm font-medium text-emerald-700 mb-6">
          <ShieldCheck size={16} />
          Mini ERP — End-to-End Business Management
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
          Smart & Connected{" "}
          <span className="text-indigo-700">ERP System</span>
        </h1>

        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          A unified Enterprise Resource Planning platform that connects
          Product Management, Sales, Purchasing, Manufacturing, Inventory,
          and Procurement into one seamless business workflow.
        </p>

        {status === "loading" ? (
          <div className="h-5 w-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
        ) : user ? (
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Go to Dashboard
            </Button>
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register">
              <Button size="lg">Get Started</Button>
            </Link>

            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        <p className="mt-8 text-sm text-gray-500">
          Product Management • Sales • Purchase • Manufacturing • Inventory • Procurement
        </p>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything Your Business Needs
            </h2>

            <p className="text-gray-600 max-w-2xl mx-auto">
              Manage products, sales, procurement, manufacturing, and
              inventory through one centralized ERP platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-6">
                  <Icon size={28} />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {title}
                </h3>

                <p className="text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Challenges & Solution */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Challenges */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Business Challenges
            </h2>

            <p className="text-gray-600 mb-4">
              Modern businesses often face operational inefficiencies due to
              disconnected systems and manual processes.
            </p>

            <ul className="space-y-4 text-gray-700">
              <li>❌ Disconnected spreadsheets and manual record keeping</li>
              <li>❌ Lack of real-time inventory visibility</li>
              <li>❌ Delayed procurement and purchasing decisions</li>
              <li>❌ Inefficient manufacturing planning</li>
              <li>❌ Inventory stockouts and overstock situations</li>
              <li>❌ Limited business insights and reporting</li>
            </ul>
          </div>

          {/* Solution */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              ERP Solution
            </h2>

            <p className="text-gray-600 mb-4">
              Our Mini ERP System digitizes and automates the complete
              business workflow.
            </p>

            <ul className="space-y-4 text-gray-700">
              <li>✅ Centralized Product Management</li>
              <li>✅ Sales & Purchase Order Processing</li>
              <li>✅ Manufacturing & Production Tracking</li>
              <li>✅ Bill of Materials (BoM) Management</li>
              <li>✅ Real-Time Inventory Monitoring</li>
              <li>✅ Automated Procurement Workflows</li>
              <li>✅ Stock Ledger & Audit Logs</li>
              <li>✅ End-to-End Business Visibility</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete ERP Workflow
            </h2>

            <p className="text-gray-600 max-w-2xl mx-auto">
              From product creation to customer delivery, every process is
              connected and automated.
            </p>
          </div>

          <div className="grid md:grid-cols-7 gap-4 text-center">
            {[
              "Products",
              "Sales",
              "Inventory",
              "Procurement",
              "Purchasing",
              "Manufacturing",
              "Delivery",
            ].map((step) => (
              <div
                key={step}
                className="bg-gray-50 rounded-xl p-5 border border-gray-200"
              >
                <span className="font-semibold text-gray-800">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
              <Factory size={20} />
            </div>

            <span className="font-bold text-xl">
              Mini ERP System
            </span>
          </div>

          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/login" className="hover:text-gray-900">
              Sign In
            </Link>

            <Link href="/register" className="hover:text-gray-900">
              Register
            </Link>

            <Link href="/dashboard" className="hover:text-gray-900">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

