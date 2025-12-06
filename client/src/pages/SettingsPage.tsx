import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Settings, User, Bell, Lock, Mail, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderUpdates: true,
    campaignAlerts: true,
    cashbackAlerts: true,
  });

  // Buscar dados do usuário atual
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const handleUpdateProfile = () => {
    // TODO: Implementar atualização de perfil via API
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso!",
    });
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implementar mudança de senha via API
    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso!",
    });

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e informações da conta</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize suas informações de perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={profileData.name || currentUser?.name || ""}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email || currentUser?.email || ""}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="seu@email.com"
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado. Entre em contato com o administrador.
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <Button onClick={handleUpdateProfile}>
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>

          {currentUser?.role === "supplier" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Informações da Empresa
                </CardTitle>
                <CardDescription>Dados da sua empresa/fornecedor</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Para atualizar informações da empresa, acesse a página de Fornecedores.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Atualize sua senha para manter sua conta segura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Digite sua senha atual"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Digite sua nova senha"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Digite novamente sua nova senha"
                />
              </div>

              <Button onClick={handleChangePassword}>
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>Escolha como você deseja ser notificado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações importantes por email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="orderUpdates">Atualizações de Pedidos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações sobre status dos pedidos
                  </p>
                </div>
                <Switch
                  id="orderUpdates"
                  checked={notifications.orderUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, orderUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="campaignAlerts">Alertas de Campanhas</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações sobre novas campanhas e promoções
                  </p>
                </div>
                <Switch
                  id="campaignAlerts"
                  checked={notifications.campaignAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, campaignAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cashbackAlerts">Alertas de Cashback</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações sobre cashback disponível
                  </p>
                </div>
                <Switch
                  id="cashbackAlerts"
                  checked={notifications.cashbackAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, cashbackAlerts: checked })
                  }
                />
              </div>

              <Button onClick={() => {
                // TODO: Salvar preferências via API
                toast({
                  title: "Preferências salvas",
                  description: "Suas preferências de notificação foram atualizadas!",
                });
              }}>
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage;

