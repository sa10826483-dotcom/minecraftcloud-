'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { CalendarClock, Plus, Trash2, Power, Play, Clock, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';

interface ScheduleItem {
  id: string;
  name: string;
  cronExpression: string;
  action: 'RESTART' | 'BACKUP' | 'COMMAND' | 'STOP' | 'START';
  commandPayload?: string;
  isEnabled: boolean;
  nextRun: string;
}

export default function DedicatedSchedulesPage() {
  const params = useParams();
  const serverId = params?.id as string;

  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      id: 'sc-1',
      name: 'Daily 4:00 AM Server Restart',
      cronExpression: '0 4 * * *',
      action: 'RESTART',
      isEnabled: true,
      nextRun: 'Tomorrow at 4:00 AM',
    },
    {
      id: 'sc-2',
      name: 'Nightly Full World Backup',
      cronExpression: '30 4 * * *',
      action: 'BACKUP',
      commandPayload: 'FULL',
      isEnabled: true,
      nextRun: 'Tomorrow at 4:30 AM',
    },
    {
      id: 'sc-3',
      name: 'Broadcast Server Maintenance Notice',
      cronExpression: '45 3 * * *',
      action: 'COMMAND',
      commandPayload: 'say [Notice] Automatic maintenance in 15 minutes!',
      isEnabled: true,
      nextRun: 'Tomorrow at 3:45 AM',
    },
  ]);

  const [newModal, setNewModal] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [cronExpr, setCronExpr] = useState('0 4 * * *');
  const [actionType, setActionType] = useState<'RESTART' | 'BACKUP' | 'COMMAND' | 'STOP' | 'START'>('RESTART');
  const [commandPayload, setCommandPayload] = useState('');

  const handleCreate = async () => {
    if (!taskName.trim()) return;
    const newTask: ScheduleItem = {
      id: `sc-${Date.now()}`,
      name: taskName,
      cronExpression: cronExpr,
      action: actionType,
      commandPayload: actionType === 'COMMAND' ? commandPayload : undefined,
      isEnabled: true,
      nextRun: 'Calculated by cloud daemon',
    };
    setSchedules((prev) => [...prev, newTask]);
    setNewModal(false);
    setTaskName('');
  };

  const handleToggle = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const handleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-emerald-400" /> Persistent Cloud Scheduler
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cron jobs are executed directly by the cloud node host daemon independently of web sessions.
          </p>
        </div>
        <Button variant="glow" size="sm" onClick={() => setNewModal(true)} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Add Scheduled Task
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {schedules.map((task) => (
          <Card
            key={task.id}
            className={`border-slate-800 transition-all ${
              task.isEnabled ? 'bg-slate-900/60' : 'bg-slate-950/40 opacity-60'
            }`}
          >
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-white text-sm">{task.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {task.action}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                  <span>Cron: <strong className="text-white">{task.cronExpression}</strong></span>
                  <span>Next: {task.nextRun}</span>
                  {task.commandPayload && (
                    <span className="text-cyan-400 truncate max-w-xs">Cmd: {task.commandPayload}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggle(task.id)}
                  className={`h-8 px-2.5 ${task.isEnabled ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                  <Power className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(task.id)}
                  className="h-8 px-2.5 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Dialog
        open={newModal}
        onOpenChange={setNewModal}
        title="Schedule New Automation"
        footer={
          <>
            <Button variant="outline" onClick={() => setNewModal(false)}>
              Cancel
            </Button>
            <Button variant="glow" onClick={handleCreate}>
              Save Schedule
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Task Name</label>
            <Input
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Daily Reboot & Backup"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Action</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as any)}
              className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white"
            >
              <option value="RESTART">Restart Server</option>
              <option value="BACKUP">Run Automatic Backup</option>
              <option value="COMMAND">Execute Minecraft Console Command</option>
              <option value="STOP">Stop Server</option>
              <option value="START">Start Server</option>
            </select>
          </div>

          {actionType === 'COMMAND' && (
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Command String</label>
              <Input
                value={commandPayload}
                onChange={(e) => setCommandPayload(e.target.value)}
                placeholder="say Server reboot in 5 minutes"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Cron Expression (UTC)</label>
            <Input
              value={cronExpr}
              onChange={(e) => setCronExpr(e.target.value)}
              placeholder="0 4 * * *"
              className="font-mono"
            />
            <span className="text-[11px] text-slate-500">Standard 5-part cron syntax: min hour day month weekday</span>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
