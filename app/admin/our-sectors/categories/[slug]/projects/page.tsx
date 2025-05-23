"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { projectsService } from "@/app/service/projectsService";
import { mutate } from "swr";
import { API_BASE_URL } from "@/app/config/apiUrl";
import { Project } from "@/app/types/projects";

export default function CategoryProjectsPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const {
    projects,
    error,
    isLoading,
    isValidating,
    loadMore,
    hasMore,
    refetch
  } = projectsService.useCategoryProjects(params.slug);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const categoryName = params.slug.split("-").join(" ");

  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    if(loadingDelete) return;

    setLoadingDelete(true);

    try {
      await projectsService.deleteProject(id);

      await refetch()

      toast({
        title: "Success",
        description: "Project deleted successfully",
        variant: "default",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !projects) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-lg text-muted-foreground mb-4">Category or projects not found</p>
          <Button onClick={refetch} variant="outline">
          Refetch
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="sm:flex items-center gap-4">
          <Link href={`/admin/our-sectors/categories`}>
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{categoryName}</h1>
        </div>
        <Link href={`/admin/projects/new?category=${params.slug}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects in this Category</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Short Description</TableHead>
                  <TableHead>Extra Description</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Creation Year</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length > 0  && projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.title?.slice(0, 10)}{project.title.length > 10 && '...'}</TableCell>
                    
                    <TableCell>
                      {project.short_description ? project.short_description.slice(0, 10) + (project.short_description.length > 10 ? '...' : '') : ''}
                    </TableCell>
                    <TableCell>
                      {project.extra_description? project.extra_description.slice(0, 10) + (project.extra_description.length > 10 ? '...' : '') : ''}</TableCell>
                    <TableCell>{project.country}</TableCell>
                    <TableCell>{project.creation_date}</TableCell>
                    <TableCell>
                      {project.created_at
                          ? (() => {
                              const date = new Date(project.created_at);
                              return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                            })()
                      : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/our-sectors/categories/${params.slug}/projects/${project.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        disabled={loadingDelete}
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex justify-center items-center h-32">
              <p className="text-muted-foreground">No projects found in this category</p>
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={loadMore}
                disabled={isValidating}
                variant="outline"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
