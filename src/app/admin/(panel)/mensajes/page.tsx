import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteMessage, toggleMessageRead } from "@/lib/actions/messages";
import { adminAllMessages } from "@/lib/data";
import { Icon, icons } from "@/components/icons";

export const metadata: Metadata = {
  title: "Mensajes",
  robots: { index: false },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const all = adminAllMessages();
  const messages = filter === "unread" ? all.filter((m) => !m.read) : all;
  const unreadCount = all.filter((m) => !m.read).length;

  return (
    <>
      <PageHeader
        title="Mensajes"
        description="Los mensajes enviados desde el formulario de contacto del sitio."
      >
        <div className="flex gap-2 text-xs">
          <Link
            href="/admin/mensajes"
            className={`border px-3 py-1.5 ${
              filter !== "unread"
                ? "border-accent text-accent"
                : "border-line text-muted hover:border-accent"
            }`}
          >
            Todos ({all.length})
          </Link>
          <Link
            href="/admin/mensajes?filter=unread"
            className={`border px-3 py-1.5 ${
              filter === "unread"
                ? "border-accent text-accent"
                : "border-line text-muted hover:border-accent"
            }`}
          >
            Sin leer ({unreadCount})
          </Link>
        </div>
      </PageHeader>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="border border-line bg-bg p-5 text-sm text-muted">
            No hay mensajes {filter === "unread" ? "sin leer" : ""}.
          </p>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={`border bg-bg p-5 ${
                message.read ? "border-line" : "border-accent/50"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {message.name}
                    {!message.read ? (
                      <span className="ml-2 bg-accent/10 px-1.5 py-0.5 text-[10px] tracking-wider text-accent uppercase">
                        nuevo
                      </span>
                    ) : null}
                  </p>
                  <a
                    href={`mailto:${message.email}`}
                    className="mt-0.5 inline-block text-sm text-accent underline underline-offset-4"
                  >
                    {message.email}
                  </a>
                </div>
                <p className="text-xs text-muted">
                  {formatDate(message.createdAt)}
                </p>
              </div>

              <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-muted">
                {message.body}
              </p>

              <div className="mt-5 flex items-center gap-3">
                <form action={toggleMessageRead}>
                  <input type="hidden" name="id" value={message.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    <Icon path={message.read ? icons.eye : icons.check} className="size-3.5" />
                    {message.read ? "Marcar como no leído" : "Marcar como leído"}
                  </button>
                </form>
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={message.id} />
                  <ConfirmButton
                    message={`¿Eliminar el mensaje de ${message.name}?`}
                  />
                </form>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
