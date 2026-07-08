'use client';

import { Badge, Button, Card, Input, Label, Switch, Textarea, useToast } from '@pranakaia/ui';
import { FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';
import { type CmsPage, deleteCmsPageAction, upsertCmsPageAction } from '@/actions/cms-pages';

type CmsPagesManagerProps = {
  initialPages: CmsPage[];
  initialError?: string | null;
};

type CmsFormState = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
};

type SafeActionResponse<T> = {
  data?: T;
  serverError?: string;
  validationErrors?: unknown;
};

const EMPTY_FORM: CmsFormState = {
  slug: '/nueva-pagina',
  title: '',
  excerpt: '',
  content: '',
  seoTitle: '',
  seoDescription: '',
  isPublished: false,
};

function toFormState(page: CmsPage): CmsFormState {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    excerpt: page.excerpt,
    content: page.content,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    isPublished: page.isPublished,
  };
}

function formatUpdatedAt(value: string): string {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'sin fecha';
  }

  return parsedDate.toLocaleString('es-CL');
}

export function CmsPagesManager({ initialPages, initialError }: CmsPagesManagerProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [pages, setPages] = useState<CmsPage[]>(initialPages);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(initialPages[0]?.id ?? null);
  const [form, setForm] = useState<CmsFormState>(
    initialPages[0] ? toFormState(initialPages[0]) : EMPTY_FORM,
  );

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) ?? null,
    [pages, selectedPageId],
  );

  const handleSelectPage = (page: CmsPage) => {
    setSelectedPageId(page.id);
    setForm(toFormState(page));
  };

  const handleCreateNew = () => {
    setSelectedPageId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = (await upsertCmsPageAction({
        id: form.id,
        slug: form.slug,
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        isPublished: form.isPublished,
      })) as SafeActionResponse<{ success: boolean; data?: CmsPage; error?: string }>;

      const payload = result.data;

      if (payload?.success && payload.data) {
        const nextPage = payload.data;

        setPages((currentPages) => {
          const withoutCurrent = currentPages.filter((page) => page.id !== nextPage.id);
          return [nextPage, ...withoutCurrent].sort((left, right) =>
            right.updatedAt.localeCompare(left.updatedAt),
          );
        });
        setSelectedPageId(nextPage.id);
        setForm(toFormState(nextPage));

        toast({
          title: 'Pagina guardada',
          description: `Se actualizo ${nextPage.slug}.`,
        });
        return;
      }

      toast({
        variant: 'destructive',
        title: 'No se pudo guardar la pagina',
        description:
          payload?.error ??
          result.serverError ??
          'Valida los datos del formulario e intenta otra vez.',
      });
    });
  };

  const handleDelete = () => {
    if (!selectedPage) {
      return;
    }

    if (!window.confirm(`Eliminar la pagina ${selectedPage.slug}?`)) {
      return;
    }

    startTransition(async () => {
      const result = (await deleteCmsPageAction({
        id: selectedPage.id,
      })) as SafeActionResponse<{ success: boolean; error?: string }>;

      if (result.data?.success) {
        setPages((currentPages) => currentPages.filter((page) => page.id !== selectedPage.id));
        setSelectedPageId(null);
        setForm(EMPTY_FORM);
        toast({
          title: 'Pagina eliminada',
          description: `${selectedPage.slug} ya no aparece en el CMS.`,
        });
        return;
      }

      toast({
        variant: 'destructive',
        title: 'No se pudo eliminar la pagina',
        description:
          result.data?.error ?? result.serverError ?? 'Intenta nuevamente en unos segundos.',
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CMS Pages</h1>
          <p className="text-sm text-muted-foreground">
            Gestion de paginas estaticas, contenido y metadatos SEO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleCreateNew} disabled={isPending}>
            <Plus className="mr-2 h-4 w-4" /> Nueva pagina
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending || !form.title || !form.slug}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando
              </>
            ) : (
              <>Guardar cambios</>
            )}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || !selectedPage}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </Button>
        </div>
      </div>

      {initialError ? (
        <Card className="border-red-500/40 bg-red-500/5 p-4 text-sm text-red-200">
          No fue posible cargar el listado inicial del CMS: {initialError}
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Paginas ({pages.length})
            </h2>
          </div>

          <div className="space-y-2">
            {pages.length === 0 ? (
              <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No hay paginas aun. Crea la primera desde este panel.
              </p>
            ) : (
              pages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                    selectedPageId === page.id
                      ? 'border-primary/60 bg-primary/5'
                      : 'border-border hover:bg-muted/40'
                  }`}
                  onClick={() => handleSelectPage(page)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{page.title}</p>
                    {page.isPublished ? (
                      <Badge variant="secondary" className="shrink-0">
                        Publicada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        Borrador
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{page.slug}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Actualizada: {formatUpdatedAt(page.updatedAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">
              {selectedPage ? `Editando ${selectedPage.slug}` : 'Nueva pagina'}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cms-title">Titulo</Label>
              <Input
                id="cms-title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Politica de envios"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cms-slug">Slug</Label>
              <Input
                id="cms-slug"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="/politica-envios"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cms-excerpt">Resumen</Label>
            <Textarea
              id="cms-excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
              placeholder="Resumen breve para listados o buscadores"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cms-content">Contenido</Label>
            <Textarea
              id="cms-content"
              rows={12}
              value={form.content}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              placeholder="Contenido principal de la pagina..."
              disabled={isPending}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cms-seo-title">SEO title</Label>
              <Input
                id="cms-seo-title"
                value={form.seoTitle}
                onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))}
                placeholder="Politica de envios | PranaKaia"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cms-seo-description">SEO description</Label>
              <Input
                id="cms-seo-description"
                value={form.seoDescription}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, seoDescription: event.target.value }))
                }
                placeholder="Descripcion para buscadores"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Publicada</p>
              <p className="text-xs text-muted-foreground">
                Si esta desactivado, la pagina queda en borrador interno.
              </p>
            </div>
            <Switch
              checked={form.isPublished}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isPublished: checked }))}
              disabled={isPending}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
