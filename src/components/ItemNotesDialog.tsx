// src/components/ItemNotesDialog.tsx

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ItemNotesDialogProps {
  itemName: string;
  notes: string;
  onNotesChange: (notes: string) => void;
}

function ItemNotesContent({ itemName, notes, onNotesChange, setOpen }: ItemNotesDialogProps & { setOpen: (open: boolean) => void }) {
    const [tempNotes, setTempNotes] = useState(notes);
    
    const handleSave = () => {
        onNotesChange(tempNotes);
        setOpen(false);
    };

    return (
        <>
            <div className="space-y-4 p-4">
                <div>
                    <Label htmlFor="notes">Catatan untuk {itemName}</Label>
                    <Textarea
                        id="notes"
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Tambahkan catatan khusus..."
                        className="mt-1 min-h-[120px]"
                        autoFocus
                    />
                </div>
            </div>
            <DrawerFooter className="pt-2 flex-row gap-2">
                <DrawerClose asChild>
                    <Button variant="outline" className="flex-1">Batal</Button>
                </DrawerClose>
                <Button onClick={handleSave} className="flex-1">Simpan</Button>
            </DrawerFooter>
        </>
    );
}

export default function ItemNotesDialog(props: ItemNotesDialogProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
      return (
          <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                  <Button size="sm" variant={props.notes ? "default" : "outline"}><MessageSquare className="h-3 w-3" /></Button>
              </DrawerTrigger>
              <DrawerContent>
                  <DrawerHeader>
                      <DrawerTitle>Catatan Item</DrawerTitle>
                  </DrawerHeader>
                  <ItemNotesContent {...props} setOpen={setOpen} />
              </DrawerContent>
          </Drawer>
      );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
          <Button size="sm" variant={props.notes ? "default" : "outline"}><MessageSquare className="h-3 w-3" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Catatan untuk {props.itemName}</DialogTitle>
        </DialogHeader>
        <ItemNotesContent {...props} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}