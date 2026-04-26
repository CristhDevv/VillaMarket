"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MagnifyingGlass, Trash, Users, Key } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "OWNER" | "ADMIN";
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsuariosPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Estados para reset de contraseña
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let url = "/api/admin/users?";
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (filterRole !== "ALL") url += `role=${filterRole}&`;
    
    const res = await fetch(url).then(r => r.json());
    setUsers(res.data || []);
    setLoading(false);
  }, [search, filterRole]);

  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  const updateRole = async (id: string, newRole: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole as any } : u));
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    const res = await fetch(`/api/admin/users/${deleteConfirm}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const resetPassword = async () => {
    if (!resetTarget || newPassword.length < 6) return;
    setResetLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${resetTarget}/reset-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        alert("Contraseña actualizada correctamente");
        setResetTarget(null);
        setNewPassword("");
      } else {
        alert("Error al resetear contraseña");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setResetLoading(false);
    }
  };

  const roleColors: Record<string, string> = {
    CUSTOMER: "text-blue-700 bg-blue-50",
    OWNER: "text-green-700 bg-green-50",
    ADMIN: "text-purple-700 bg-purple-50",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Gestión de Usuarios</h1>
        <p className="text-sm text-muted mt-0.5">{users.length} usuarios encontrados</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-card bg-white border border-border text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="h-11 px-4 rounded-card bg-white border border-border text-sm focus:outline-none focus:border-accent"
        >
          <option value="ALL">Todos los roles</option>
          <option value="CUSTOMER">Clientes</option>
          <option value="OWNER">Dueños de negocio</option>
          <option value="ADMIN">Administradores</option>
        </select>
      </div>

      <div className="bg-white border border-border rounded-card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted">Cargando usuarios...</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">
            <Users size={40} className="mx-auto mb-3 opacity-20" />
            No se encontraron usuarios
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-border text-xs font-bold text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Registro</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Pedidos Activos</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const isSelf = session?.user?.id === user.id;
                  const canDelete = user._count.orders === 0 && !isSelf;

                  return (
                    <tr key={user.id} className={`hover:bg-surface/50 transition-colors ${isSelf ? "bg-accent/5" : ""}`}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-foreground">
                          {user.name || "Sin nombre"} {isSelf && <span className="text-[10px] bg-accent text-white px-1.5 py-0.5 rounded ml-1 uppercase">Tú</span>}
                        </p>
                        <p className="text-[10px] text-muted">{user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {format(new Date(user.createdAt), "d MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => updateRole(user.id, e.target.value)}
                          disabled={isSelf}
                          className={`text-xs font-bold px-2 py-1 rounded-pill outline-none appearance-none cursor-pointer ${roleColors[user.role]} ${isSelf ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="OWNER">OWNER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-pill ${user._count.orders > 0 ? "bg-yellow-50 text-yellow-700" : "bg-surface text-muted"}`}>
                          {user._count.orders}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setResetTarget(user.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-blue-50 text-blue-500 hover:bg-blue-100"
                            title="Resetear contraseña"
                          >
                            <Key size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            disabled={!canDelete}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              canDelete 
                                ? "bg-red-50 text-red-500 hover:bg-red-100" 
                                : "bg-surface text-border cursor-not-allowed"
                            }`}
                            title={!canDelete ? "No se puede eliminar: tiene pedidos activos o eres tú" : "Eliminar"}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card w-full max-w-sm p-6 space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
              <Trash size={24} weight="fill" />
            </div>
            <h3 className="text-lg font-black text-foreground">¿Eliminar usuario?</h3>
            <p className="text-sm text-muted">
              Esta acción no se puede deshacer. Se eliminarán permanentemente los datos del usuario.
            </p>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-11 bg-surface border border-border text-foreground font-medium rounded-pill text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-11 bg-red-600 text-white font-bold rounded-pill text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reset Password */}
      {resetTarget && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-foreground">Resetear contraseña</h3>
            <p className="text-sm text-muted">Ingresa la nueva contraseña para este usuario.</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full h-11 px-4 rounded-pill border border-border text-sm outline-none focus:border-accent"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setResetTarget(null); setNewPassword(""); }}
                className="flex-1 h-11 bg-surface border border-border text-foreground font-medium rounded-pill text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={resetPassword}
                disabled={newPassword.length < 6 || resetLoading}
                className="flex-1 h-11 bg-accent text-white font-bold rounded-pill text-sm disabled:opacity-50"
              >
                {resetLoading ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
