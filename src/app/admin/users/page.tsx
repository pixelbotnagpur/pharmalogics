
'use client';

import { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  User, 
  ShieldCheck, 
  MoreHorizontal, 
  Mail,
  Calendar,
  Loader2,
  Trash2,
  Activity,
  Users as UsersIcon,
  Filter,
  UserPlus,
  Fingerprint,
  Crown,
  BookOpen,
  Truck,
  Check,
  UserMinus
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { StatusDialog } from '@/components/common/StatusDialog';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase,
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
  useUser
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { cn } from '@/lib/utils';

type AdminRoleType = 'Super Admin' | 'Content Manager' | 'Logistics Staff';

const ROLE_CONFIG: Record<AdminRoleType, { icon: any; color: string; desc: string }> = {
  'Super Admin': { icon: Crown, color: 'bg-primary text-white border-primary', desc: 'Full infrastructure sovereignty.' },
  'Content Manager': { icon: BookOpen, color: 'bg-blue-500/10 text-blue-600 border-blue-200', desc: 'Catalog & CMS management.' },
  'Logistics Staff': { icon: Truck, color: 'bg-orange-500/10 text-orange-600 border-orange-200', desc: 'Fulfillment & QC audits.' },
};

export default function AdminUsersPage() {
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const [statusDialog, setStatusDialog] = useState({ open: false, title: '', desc: '' });

  // Provisioning Modal State
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionData, setProvisionData] = useState({ 
    uid: '', 
    email: '', 
    firstName: '', 
    lastName: '',
    role: 'Content Manager' as AdminRoleType
  });

  // Deletion Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; user: UserProfile | null }>({
    open: false,
    user: null
  });

  // Role Revocation State
  const [revokeConfirm, setRevokeConfirm] = useState<{ open: boolean; user: UserProfile | null }>({
    open: false,
    user: null
  });

  // Data Fetching
  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const adminRolesQuery = useMemoFirebase(() => collection(db, 'roles_admin'), [db]);
  const { data: adminRoles, isLoading: rolesLoading } = useCollection<{ uid: string; role: AdminRoleType; email: string }>(adminRolesQuery);

  const getAdminRole = (uid: string) => adminRoles?.find(role => role.id === uid)?.role;

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(u => {
      const matchesSearch = 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      const role = getAdminRole(u.id);
      if (activeTab === 'admins') return !!role;
      if (activeTab === 'users') return !role;
      
      return true;
    });
  }, [users, searchTerm, activeTab, adminRoles]);

  const handleUpdateRole = (user: UserProfile, role: AdminRoleType | null) => {
    const roleRef = doc(db, 'roles_admin', user.id);

    if (role === null) {
      setRevokeConfirm({ open: true, user });
    } else {
      setDocumentNonBlocking(roleRef, {
        uid: user.id,
        role: role,
        grantedAt: new Date().toISOString(),
        email: user.email
      });
      setStatusDialog({
        open: true,
        title: "Identity Scaled",
        desc: `${user.firstName} ${user.lastName} has been successfully assigned the ${role} governance protocol.`
      });
    }
  };

  const handleCommitRevocation = () => {
    if (!revokeConfirm.user) return;
    const roleRef = doc(db, 'roles_admin', revokeConfirm.user.id);
    deleteDocumentNonBlocking(roleRef);
    setRevokeConfirm({ open: false, user: null });
    
    toast({ title: "Privileges Revoked", description: "Identity node transitioned to standard user." });
    
    // UI Reset Protocol
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleDeleteUser = (user: UserProfile) => {
    setDeleteConfirm({ open: true, user });
  };

  const handleCommitDeletion = () => {
    if (!deleteConfirm.user) return;
    const userRef = doc(db, 'users', deleteConfirm.user.id);
    const roleRef = doc(db, 'roles_admin', deleteConfirm.user.id);

    deleteDocumentNonBlocking(userRef);
    deleteDocumentNonBlocking(roleRef);
    setDeleteConfirm({ open: false, user: null });

    toast({ title: "Identity Terminated", description: "The profile node has been purged from the registry." });

    // UI Reset Protocol
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleBootstrapIdentity = () => {
    if (!currentUser) return;

    const profileRef = doc(db, 'users', currentUser.uid);
    const roleRef = doc(db, 'roles_admin', currentUser.uid);

    const profileData = {
      id: currentUser.uid,
      email: currentUser.email || 'anonymous@pharmlogics.dev',
      firstName: 'Bootstrap',
      lastName: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDocumentNonBlocking(profileRef, profileData);
    setDocumentNonBlocking(roleRef, {
      uid: currentUser.uid,
      role: 'Super Admin',
      grantedAt: new Date().toISOString(),
      email: profileData.email
    });

    setStatusDialog({
      open: true,
      title: "Registry Initialized",
      desc: "Current session has been established as the primary Super Admin node."
    });
  };

  const handleManualProvision = () => {
    if (!provisionData.uid || !provisionData.email) return;

    const profileRef = doc(db, 'users', provisionData.uid);
    const roleRef = doc(db, 'roles_admin', provisionData.uid);

    const profileData = {
      id: provisionData.uid,
      email: provisionData.email,
      firstName: provisionData.firstName || 'Provisioned',
      lastName: provisionData.lastName || 'Node',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDocumentNonBlocking(profileRef, profileData);
    setDocumentNonBlocking(roleRef, {
      uid: provisionData.uid,
      role: provisionData.role,
      grantedAt: new Date().toISOString(),
      email: provisionData.email
    });

    setIsProvisioning(false);
    setStatusDialog({
      open: true,
      title: "Node Provisioned",
      desc: `${provisionData.email} has been established in the registry.`
    });
    setProvisionData({ uid: '', email: '', firstName: '', lastName: '', role: 'Content Manager' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-normal text-primary">Identity Registry</h1>
          <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Granular Privilege Governance</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search registry..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10 w-full md:w-72 bg-card border-none shadow-sm text-sm" 
            />
          </div>
          <Button onClick={() => setIsProvisioning(true)} className="h-11 px-6 shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90 border-none">
            <UserPlus className="h-4 w-4 mr-2" /> Provision Admin
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-primary text-white border-none shadow-lg rounded-xl">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Total Population</p>
              <p className="text-xl font-headline">{users?.length || 0} Profile(s)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-sm rounded-xl">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Governing Nodes</p>
              <p className="text-xl font-headline">{adminRoles?.length || 0} Admin(s)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-sm rounded-xl">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-600">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Clinical Integrity</p>
              <p className="text-xl font-headline">99.9% Verified</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-12">
          <TabsList className="h-auto p-0 bg-transparent flex flex-wrap justify-start gap-2">
            {[
              { value: 'all', label: 'All Profiles', icon: UsersIcon },
              { value: 'users', label: 'Clinical Users', icon: User },
              { value: 'admins', label: 'Governing Tiers', icon: ShieldCheck },
            ].map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="rounded-md px-6 py-3 border border-border/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-[10px] font-bold uppercase tracking-widest"
              >
                <tab.icon className="h-3 w-3 mr-2" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <Badge variant="outline" className="font-mono text-[10px] bg-card h-10 px-4 flex items-center gap-2 border-border/50">
            <Filter className="h-3 w-3 opacity-40" />
            Showing {filteredUsers.length} node(s)
          </Badge>
        </div>

        <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm overflow-hidden rounded-xl bg-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest pl-6">User Identity</TableHead>
                    <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Enrollment Date</TableHead>
                    <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Privilege Level</TableHead>
                    <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-right pr-6">Governance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(usersLoading || rolesLoading) ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" />
                        <p className="mt-4 uppercase text-[10px] font-bold tracking-widest opacity-40">Syncing Identity Registry...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.map((u) => {
                    const role = getAdminRole(u.id);
                    const RoleIcon = role ? ROLE_CONFIG[role].icon : User;
                    return (
                      <TableRow key={u.id} className="border-border/20 hover:bg-muted/5 transition-colors group">
                        <TableCell className="pl-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center font-headline text-lg",
                              role ? "bg-primary text-white" : "bg-muted text-primary"
                            )}>
                              {u.firstName?.[0] || '?'}{u.lastName?.[0] || '?'}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{u.firstName} {u.lastName}</span>
                              <span className="text-[10px] text-muted-foreground font-light">{u.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-xs font-light">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {role ? (
                            <Badge variant="primary" className={cn("text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 border-none", ROLE_CONFIG[role].color)}>
                              <RoleIcon className="h-3 w-3 mr-1.5" /> {role}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5">
                              Clinical User
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-[10px] font-bold uppercase tracking-widest w-56 p-2">
                              <p className="px-2 py-1.5 text-[8px] opacity-40">ASSIGN CLINICAL ROLE</p>
                              {Object.keys(ROLE_CONFIG).map((r) => (
                                <DropdownMenuItem 
                                  key={r}
                                  className={cn("flex items-center gap-2 cursor-pointer p-2 rounded", role === r && "bg-primary/5 text-primary")} 
                                  onClick={() => handleUpdateRole(u, r as AdminRoleType)}
                                >
                                  {role === r ? <Check className="h-3 w-3 text-primary" /> : <ShieldCheck className="h-3 w-3 text-muted-foreground" />} 
                                  Set as {r}
                                </DropdownMenuItem>
                              ))}
                              <div className="h-px bg-border/50 my-1" />
                              <DropdownMenuItem 
                                className="flex items-center gap-2 cursor-pointer p-2 rounded text-muted-foreground hover:bg-accent/10"
                                onClick={() => handleUpdateRole(u, null)}
                              >
                                <UserMinus className="h-3 w-3" /> Revoke Admin Access
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="flex items-center gap-2 cursor-pointer p-2 rounded text-destructive hover:bg-destructive/5"
                                onClick={() => handleDeleteUser(u)}
                              >
                                <Trash2 className="h-3 w-3" /> Terminate Identity Node
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {!usersLoading && filteredUsers.length === 0 && (
                <div className="py-24 text-center space-y-8">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-6">
                    <div className="relative">
                      <UsersIcon className="h-16 w-16 text-muted-foreground/20" strokeWidth={1} />
                      <Fingerprint className="h-8 w-8 text-primary absolute -bottom-2 -right-2 bg-background p-1.5 rounded-full border border-border/20 shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-headline">Registry Node Empty</h3>
                      <p className="text-sm text-muted-foreground font-light">
                        No clinical profiles detected. Sync your session as Super Admin to initialize the governance layer.
                      </p>
                    </div>
                    <div className="flex flex-col w-full gap-3">
                      <Button onClick={handleBootstrapIdentity} className="h-12 w-full uppercase text-[10px] font-bold tracking-widest bg-primary text-white hover:bg-primary/90 border-none">
                        Bootstrap Current Session (Super Admin)
                      </Button>
                      <Button variant="outline" onClick={() => setIsProvisioning(true)} className="h-12 w-full uppercase text-[10px] font-bold tracking-widest">
                        Provision External Node
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Provisioning Dialog */}
      <Dialog open={isProvisioning} onOpenChange={setIsProvisioning}>
        <DialogContent className="max-w-md bg-card border-none shadow-2xl rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-primary text-white">
            <DialogTitle className="font-headline text-xl">Identity Provisioning</DialogTitle>
            <DialogDescription className="text-white/70 font-light mt-1">
              Authorize an external clinical administrative node.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Firebase UID</Label>
                <Input 
                  placeholder="Paste user UID from authentication..." 
                  value={provisionData.uid}
                  onChange={(e) => setProvisionData({...provisionData, uid: e.target.value})}
                  className="h-12 bg-muted/20 border-none font-mono text-xs" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Clinical Email</Label>
                <Input 
                  placeholder="staff@pharmlogics.com" 
                  value={provisionData.email}
                  onChange={(e) => setProvisionData({...provisionData, email: e.target.value})}
                  className="h-12 bg-muted/20 border-none" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Governance Tier</Label>
                <Select value={provisionData.role} onValueChange={(val) => setProvisionData({...provisionData, role: val as AdminRoleType})}>
                  <SelectTrigger className="h-12 bg-muted/20 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ROLE_CONFIG).map((r) => (
                      <SelectItem key={r} value={r} className="text-xs uppercase font-bold tracking-widest">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[9px] text-muted-foreground italic mt-1">{ROLE_CONFIG[provisionData.role].desc}</p>
              </div>
            </div>

            <Button onClick={handleManualProvision} className="w-full h-14 uppercase text-[11px] font-bold tracking-[0.2em] shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90 border-none">
              Establish Administrative Node
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revocation Confirmation */}
      <AlertDialog open={revokeConfirm.open} onOpenChange={(open) => setRevokeConfirm(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="bg-card border-none shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-xl flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Revoke Privileges?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-light pt-2">
              This will remove all clinical administrative permissions for <span className="text-foreground font-medium">{revokeConfirm.user?.firstName} {revokeConfirm.user?.lastName}</span>. They will be transitioned back to a standard clinical user node.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="uppercase text-[10px] font-bold tracking-widest h-12 rounded-md border-border/20">Maintain Tier</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCommitRevocation}
              className="bg-primary text-white hover:bg-primary/90 uppercase text-[10px] font-bold tracking-widest h-12 rounded-md border-none"
            >
              Confirm Revocation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deletion Confirmation */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="bg-card border-none shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-xl flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Terminate Identity?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-light pt-2">
              This action is irreversible. It will permanently purge the identity node for <span className="text-foreground font-medium">{deleteConfirm.user?.firstName} {deleteConfirm.user?.lastName}</span>. All profile data and clinical audit history for this user will be removed from the registry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="uppercase text-[10px] font-bold tracking-widest h-12 rounded-md border-border/20">Cancel Purge</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCommitDeletion}
              className="bg-destructive text-white hover:bg-destructive/90 uppercase text-[10px] font-bold tracking-widest h-12 rounded-md border-none"
            >
              Terminate Node
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StatusDialog 
        open={statusDialog.open} 
        onOpenChange={(open) => setStatusDialog(prev => ({ ...prev, open }))}
        title={statusDialog.title}
        description={statusDialog.desc}
      />
    </div>
  );
}
