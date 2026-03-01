import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft } from 'lucide-react';

interface AccessDeniedScreenProps {
  message?: string;
  backPath?: string;
}

export default function AccessDeniedScreen({
  message = 'You do not have permission to access this page.',
  backPath = '/',
}: AccessDeniedScreenProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <ShieldX className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Link to={backPath}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </Link>
      </div>
    </div>
  );
}
