'use client';

import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@pranakaia/ui';
import { Eye, MoreVertical, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { toggleCustomerStatus, updateCustomerRole } from '../../actions/admin-customers';

export interface Customer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string | Date;
}

export default function CustomersTableClient({ customers }: { customers: Customer[] }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleToggleStatus = async (userId: string, currentIsActive: boolean) => {
    setUpdatingId(userId);
    try {
      await toggleCustomerStatus(userId, currentIsActive);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    setUpdatingId(userId);
    try {
      const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
      await updateCustomerRole(userId, newRole);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
          <TableHead className="w-25">ID Cliente</TableHead>
          <TableHead>Nombre / Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Registro</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
              No se han registrado clientes en la plataforma.
            </TableCell>
          </TableRow>
        ) : (
          customers.map((customer) => {
            const customerName =
              customer.firstName || customer.lastName
                ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                : 'Sin Nombre';

            return (
              <TableRow
                key={customer.id}
                className={`hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors ${
                  updatingId === customer.id ? 'opacity-50' : ''
                }`}
              >
                <TableCell className="font-medium text-xs">
                  {customer.id.slice(0, 8).toUpperCase()}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{customerName}</div>
                  <div className="text-xs text-gray-400">{customer.email}</div>
                  {customer.phone && (
                    <div className="text-[10px] text-gray-400">{customer.phone}</div>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleRoleToggle(customer.id, customer.role)}
                    disabled={updatingId === customer.id}
                    className="focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] rounded"
                    type="button"
                  >
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase border-none ${
                        customer.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {customer.role}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleToggleStatus(customer.id, customer.isActive)}
                    disabled={updatingId === customer.id}
                    className="focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] rounded"
                    type="button"
                  >
                    <Badge
                      variant="default"
                      className={`text-[10px] uppercase border-none ${
                        customer.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {customer.isActive ? 'ACTIVO' : 'SUSPENDIDO'}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {new Date(customer.createdAt).toLocaleDateString('es-CL')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(customer.id, customer.isActive)}
                      className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
                      disabled={updatingId === customer.id}
                    >
                      {customer.isActive ? (
                        <UserX className="h-4 w-4 text-red-500" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
