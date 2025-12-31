/**
 * Admin Page
 *
 * Simple admin dashboard with:
 * - Overview stats (users, trades, activity)
 * - User search and list
 * - User impersonation for debugging
 *
 * REMOVAL: Delete this file and remove route from App.tsx
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  Activity,
  MessageSquare,
  Search,
  Eye,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdmin } from "@/context/AdminContext";
import {
  adminApi,
  AdminDashboardStats,
  AdminUserListItem,
  AdminActivityItem,
} from "@/api/admin";

// Stat card component
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Impersonation banner
function ImpersonationBanner() {
  const { impersonatedUser, stopImpersonation } = useAdmin();
  const navigate = useNavigate();

  if (!impersonatedUser) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span className="font-medium">
          Viewing as: {impersonatedUser.name} ({impersonatedUser.email})
        </span>
        <Badge variant="outline" className="bg-amber-400 border-amber-600">
          Read-Only Mode
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-amber-400 border-amber-600 hover:bg-amber-300"
          onClick={() => navigate("/today")}
        >
          View Dashboard
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-amber-400 border-amber-600 hover:bg-amber-300"
          onClick={stopImpersonation}
        >
          <X className="h-4 w-4 mr-1" />
          Exit
        </Button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, isCheckingAdmin, startImpersonation, impersonatedUser } =
    useAdmin();

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "users" | "activity"
  >("dashboard");

  // Load dashboard data
  useEffect(() => {
    if (!isAdmin && !isCheckingAdmin) {
      navigate("/today");
      return;
    }

    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, isCheckingAdmin, navigate]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [dashboardStats, activityData] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getRecentActivity(20),
      ]);
      setStats(dashboardStats);
      setActivity(activityData);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await adminApi.getUsers({ search, page, limit: 10 });
      setUsers(result.users);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  // Load users when search or page changes
  useEffect(() => {
    if (isAdmin && activeTab === "users") {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, activeTab, search, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleViewAsUser = (user: AdminUserListItem) => {
    startImpersonation(user);
    navigate("/today");
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div
      className={`min-h-screen bg-background ${
        impersonatedUser ? "pt-12" : ""
      }`}
    >
      <ImpersonationBanner />

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor application activity and debug user issues
            </p>
          </div>
          <Button
            variant="outline"
            onClick={loadDashboardData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "dashboard", label: "Overview" },
            { id: "users", label: "Users" },
            { id: "activity", label: "Activity" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={stats.users.total}
                subtitle={`+${stats.users.newToday} today, +${stats.users.newThisWeek} this week`}
                icon={Users}
              />
              <StatCard
                title="Total Trades"
                value={stats.trades.total}
                subtitle={`${stats.trades.openCount} open, ${stats.trades.todayCount} today`}
                icon={TrendingUp}
              />
              <StatCard
                title="Active Today"
                value={stats.activity.activeToday}
                subtitle={`${stats.activity.mindsetChecksToday} mindset checks`}
                icon={Activity}
              />
              <StatCard
                title="Suggestions"
                value={stats.suggestions.total}
                subtitle={`${stats.suggestions.pending} pending`}
                icon={MessageSquare}
              />
            </div>

            {/* Experience breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Users by Experience Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {Object.entries(stats.users.byExperience).map(
                    ([level, count]) => (
                      <div key={level} className="flex items-center gap-2">
                        <Badge variant="outline">{level || "Unset"}</Badge>
                        <span className="font-semibold">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent activity preview */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions across all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activity.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{item.details}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.userName}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {new Date(item.timestamp).toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            {/* Users table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Trades</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.experienceLevel || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.stats.totalTrades} ({user.stats.openTrades}{" "}
                          open)
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewAsUser(user)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View As
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>Recent actions across all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between py-3 border-b last:border-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            item.type === "user_joined"
                              ? "default"
                              : item.type === "trade_opened"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {item.type.replace("_", " ")}
                        </Badge>
                        <span className="font-medium">{item.details}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.userName} ({item.userEmail})
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
                {activity.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
