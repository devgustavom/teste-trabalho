import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "./ThemeToggle";
import { ShoppingBag, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";

type UserRole = "admin" | "supplier" | "retailer" | "telesales";

interface LoginPageProps {
  onLogin: (user: any, token: string) => void;
  isLoading?: boolean;
  error?: string;
}

export function LoginPage({ onLogin, isLoading: externalLoading, error: externalError }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      onLogin(response.user, response.token);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Central de Compras</CardTitle>
              <CardDescription className="mt-2">
                Faça login para acessar a plataforma
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(error || externalError) && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                  {error || externalError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || externalLoading}
                data-testid="button-login"
              >
                {isLoading || externalLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Problemas para acessar?{" "}
                <a href="#" className="text-primary underline-offset-4 hover:underline">
                  Entre em contato
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <footer className="py-4 text-center text-sm text-muted-foreground">
        Central de Compras - Todos os direitos reservados
      </footer>
    </div>
  );
}
