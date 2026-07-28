"use client";

import {
  Search,
  Eye,
  Pencil,
  Trash2,
  UserX,
} from "lucide-react";

const customers = [
  {
    id: 1,
    name: "Harsha",
    email: "harsha@gmail.com",
    phone: "+91 9876543210",
    orders: 12,
    spent: "₹32,450",
    status: "Active",
  },
  {
    id: 2,
    name: "Priya",
    email: "priya@gmail.com",
    phone: "+91 9988776655",
    orders: 5,
    spent: "₹14,300",
    status: "Active",
  },
  {
    id: 3,
    name: "Anjali",
    email: "anjali@gmail.com",
    phone: "+91 9123456780",
    orders: 1,
    spent: "₹2,999",
    status: "Blocked",
  },
];

export default function CustomersPage() {
  return (
    <main className="min-h-screen bg-[#F8F5F0] p-8">

      {/* Heading */}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Customer Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your customers efficiently.
          </p>
        </div>

        <button className="bg-[#8B1E3F] text-white px-5 py-3 rounded-xl hover:bg-[#701933]">
          + Add Customer
        </button>
      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Total Customers</h3>
          <h2 className="text-3xl font-bold mt-2">1,254</h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Active</h3>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            1,180
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Blocked</h3>
          <h2 className="text-3xl font-bold text-red-500 mt-2">
            42
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">New This Month</h3>
          <h2 className="text-3xl font-bold text-[#8B1E3F] mt-2">
            32
          </h2>
        </div>

      </div>

      {/* Search */}

      <div className="bg-white rounded-xl shadow p-5 mb-6 flex items-center gap-3">

        <Search className="text-gray-400"/>

        <input
          type="text"
          placeholder="Search customer..."
          className="w-full outline-none"
        />

      </div>

      {/* Table */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-[#8B1E3F] text-white">

            <tr>

              <th className="text-left px-6 py-4">Customer</th>

              <th className="text-left">Phone</th>

              <th className="text-left">Orders</th>

              <th className="text-left">Spent</th>

              <th className="text-left">Status</th>

              <th className="text-center">Actions</th>

            </tr>

          </thead>

          <tbody>

            {customers.map((customer) => (

              <tr
                key={customer.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="px-6 py-5">

                  <h3 className="font-semibold">
                    {customer.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {customer.email}
                  </p>

                </td>

                <td>{customer.phone}</td>

                <td>{customer.orders}</td>

                <td>{customer.spent}</td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-sm

                    ${
                      customer.status === "Active"

                        ? "bg-green-100 text-green-700"

                        : "bg-red-100 text-red-700"

                    }`}
                  >
                    {customer.status}
                  </span>

                </td>

                <td>

                  <div className="flex justify-center gap-4">

                    <button className="text-blue-600 hover:scale-110">
                      <Eye size={20}/>
                    </button>

                    <button className="text-green-600 hover:scale-110">
                      <Pencil size={20}/>
                    </button>

                    <button className="text-yellow-600 hover:scale-110">
                      <UserX size={20}/>
                    </button>

                    <button className="text-red-600 hover:scale-110">
                      <Trash2 size={20}/>
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </main>
  );
}