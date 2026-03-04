import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GroceryEmptyStateProps {
  onCreateList: () => void
}

export default function GroceryEmptyState({ onCreateList }: GroceryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <ShoppingCart className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Create your first grocery list</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Organize your shopping with lists and items. Get started by creating a new grocery list.
      </p>
      <Button onClick={onCreateList}>New Grocery List</Button>
    </div>
  )
}
