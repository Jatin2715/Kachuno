import { useState, useEffect, useCallback } from 'react';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from '../../types/task';
import { taskService, subscribeToTaskChanges } from './taskService';

export function useTasks(filters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTasks(filters);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [
    filters?.status,
    filters?.priority,
    filters?.category,
    filters?.dueDate,
    filters?.searchQuery,
  ]);

  useEffect(() => {
    fetchTasks();
    const unsubscribe = subscribeToTaskChanges(fetchTasks);
    return () => unsubscribe();
  }, [fetchTasks]);

  const createTask = useCallback(async (input: CreateTaskInput) => {
    try {
      const created = await taskService.createTask(input);
      return created;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput) => {
    try {
      const updated = await taskService.updateTask(id, input);
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    try {
      const toggled = await taskService.toggleComplete(id);
      return toggled;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskService.deleteTask(id);
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    refresh: fetchTasks,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
  };
}
