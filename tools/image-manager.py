"""
Docolco Product Manager — tools/image-manager.py
Gestión de imágenes y catálogo de productos.
Doble clic en "Iniciar Image Manager.bat" para abrir.
"""

import os
import sys
import subprocess
import threading
import webbrowser
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from pathlib import Path

try:
    from PIL import Image, ImageTk
    PILLOW_OK = True
except ImportError:
    PILLOW_OK = False

try:
    from openpyxl import load_workbook
    from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
    OPENPYXL_OK = True
except ImportError:
    OPENPYXL_OK = False

REPO_ROOT       = Path(__file__).parent.parent.resolve()
IMG_DIR         = REPO_ROOT / "img" / "productos"
GENERATE_SCRIPT = REPO_ROOT / "generate-products.py"
EXCEL_PATH      = REPO_ROOT / "data" / "products.xlsx"
SITE_URL        = "https://docolco.netlify.app"

BLUE     = "#1A3FA8"
BLUE_DRK = "#122E80"
WHITE    = "#FFFFFF"
LIGHT    = "#F8F8F6"
MUTED    = "#888888"
GREEN    = "#1B5E20"
SEP      = " — "

CATEGORIES    = ["Cleaning", "Packaging", "Protection", "Waste"]
ACCEPTED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".bmp", ".tiff", ".tif"}

if OPENPYXL_OK:
    _XL_GRAY      = PatternFill("solid", fgColor="F0F0F0")
    _XL_YELLOW    = PatternFill("solid", fgColor="FFFDE7")
    _XL_THIN      = Border(bottom=Side(style="thin", color="DDDDDD"))
    _XL_CENTER    = Alignment(horizontal="center", vertical="center")
    _XL_LEFT      = Alignment(horizontal="left",   vertical="center")
    _XL_NORM      = Font(name="Calibri", size=10)
    _XL_SKU_F     = Font(name="Calibri", color="555555", size=10)
    _XL_PRICE_FMT = "$#,##0.00"

_TREE_COLS    = ("sku", "name", "category", "unit_price", "box_price", "box_contents", "available")
_TREE_HEADERS = ("SKU",  "Nombre",  "Categoría", "P. Unit",  "P. Caja",  "Contenido",    "Activo")
_TREE_WIDTHS  = (85,     185,        95,           80,          80,         125,             58)


class ImageManagerApp(tk.Tk):

    def __init__(self):
        super().__init__()
        self.title("Docolco Product Manager")
        self.geometry("760x700")
        self.resizable(True, True)
        self.minsize(660, 580)
        self.configure(bg=WHITE)

        self._image_path    = None
        self._preview_photo = None
        self._publishing    = False
        self._catalog_dirty = False
        self._products      = self._read_excel_products()

        self._build_menu()
        self._build_ui()
        self.after(400, self._startup_check)

    # ── Data layer ────────────────────────────────────────────────────────────

    def _read_excel_products(self):
        if not OPENPYXL_OK or not EXCEL_PATH.exists():
            return []
        try:
            wb = load_workbook(EXCEL_PATH, data_only=True)
            ws = wb["Products"]
            products = []
            for row in ws.iter_rows(min_row=5, values_only=True):
                sku = row[0]
                if not sku:
                    continue
                _, name, category, unit_price, box_price, box_contents, available = row
                sku_str = str(int(float(str(sku).replace(",", ""))))
                products.append({
                    "sku":          sku_str,
                    "name":         str(name or "").strip(),
                    "category":     str(category or "").strip(),
                    "unit_price":   round(float(unit_price or 0), 2),
                    "box_price":    round(float(box_price or 0), 2),
                    "box_contents": str(box_contents or "").strip(),
                    "available":    str(available or "Y").strip().upper(),
                })
            return products
        except Exception:
            return []

    def _write_excel_products(self, products):
        if not OPENPYXL_OK:
            raise RuntimeError("openpyxl no está instalado.\nCorre tools/setup.bat primero.")
        if not EXCEL_PATH.exists():
            raise RuntimeError(f"No se encontró data/products.xlsx.\nEsperado en:\n{EXCEL_PATH}")
        wb = load_workbook(EXCEL_PATH)
        ws = wb["Products"]
        for row_num in range(5, ws.max_row + 1):
            for col in range(1, 8):
                ws.cell(row=row_num, column=col).value = None
        for i, p in enumerate(products):
            rn = i + 5
            vals = [
                int(p["sku"]) if str(p["sku"]).isdigit() else p["sku"],
                p["name"], p["category"],
                p["unit_price"], p["box_price"],
                p["box_contents"], p["available"],
            ]
            for ci, val in enumerate(vals, start=1):
                cell = ws.cell(row=rn, column=ci, value=val)
                cell.border    = _XL_THIN
                cell.alignment = _XL_CENTER if ci in (1, 3, 4, 5, 7) else _XL_LEFT
                if ci == 1:
                    cell.fill = _XL_GRAY
                    cell.font = _XL_SKU_F
                elif ci in (4, 5):
                    cell.fill          = _XL_YELLOW
                    cell.font          = _XL_NORM
                    cell.number_format = _XL_PRICE_FMT
                else:
                    cell.fill = _XL_YELLOW
                    cell.font = _XL_NORM
            ws.row_dimensions[rn].height = 30
        wb.save(EXCEL_PATH)

    # ── Menu ──────────────────────────────────────────────────────────────────

    def _build_menu(self):
        bar = tk.Menu(self)
        self.config(menu=bar)

        file_m = tk.Menu(bar, tearoff=0)
        file_m.add_command(label="Abrir carpeta del repo",
                           command=lambda: os.startfile(str(REPO_ROOT)))
        file_m.add_command(label="Abrir Excel de productos",
                           command=self._open_excel)
        bar.add_cascade(label="Archivo", menu=file_m)

        tools_m = tk.Menu(bar, tearoff=0)
        tools_m.add_command(label="Ver imágenes actuales", command=self._show_images)
        tools_m.add_command(label="Verificar estado Git",  command=self._verify_status)
        bar.add_cascade(label="Herramientas", menu=tools_m)

        help_m = tk.Menu(bar, tearoff=0)
        help_m.add_command(label="Contactar soporte", command=self._contact_support)
        bar.add_cascade(label="Ayuda", menu=help_m)

    # ── Main UI ───────────────────────────────────────────────────────────────

    def _build_ui(self):
        hdr = tk.Frame(self, bg=BLUE, height=70)
        hdr.pack(fill="x")
        hdr.pack_propagate(False)
        tk.Label(hdr, text="DOCOLCO", bg=BLUE, fg=WHITE,
                 font=("Helvetica", 18, "bold")).pack(anchor="w", padx=20, pady=(12, 0))
        tk.Label(hdr, text="Product Manager", bg=BLUE, fg="#99B8FF",
                 font=("Helvetica", 10)).pack(anchor="w", padx=20)

        self._nb = ttk.Notebook(self)
        self._nb.pack(fill="both", expand=True, padx=16, pady=12)

        self._tab_images  = tk.Frame(self._nb, bg=WHITE)
        self._tab_catalog = tk.Frame(self._nb, bg=WHITE)
        self._nb.add(self._tab_images,  text="  Imágenes  ")
        self._nb.add(self._tab_catalog, text="  Catálogo  ")

        self._nb.bind("<<NotebookTabChanged>>", self._on_tab_change)

        self._build_images_tab()
        self._build_catalog_tab()

    def _on_tab_change(self, _event):
        tab = self._nb.index(self._nb.select())
        if tab == 1 and not self._catalog_dirty:
            fresh = self._read_excel_products()
            if fresh:
                self._products = fresh
                self._reload_catalog_tree()
                self._update_combo()

    # ── Images tab ────────────────────────────────────────────────────────────

    def _build_images_tab(self):
        body = tk.Frame(self._tab_images, bg=WHITE)
        body.pack(fill="both", expand=True, padx=24, pady=16)

        tk.Label(body, text="1.  Selecciona el producto:", bg=WHITE,
                 font=("Helvetica", 11, "bold"), anchor="w").pack(fill="x", pady=(0, 5))

        self._combo_var = tk.StringVar()
        self._combo = ttk.Combobox(
            body, textvariable=self._combo_var,
            values=[f"{p['sku']}{SEP}{p['name']}" for p in self._products],
            state="readonly", font=("Helvetica", 10),
        )
        self._combo.pack(fill="x")
        self._combo.bind("<<ComboboxSelected>>", lambda _: self._refresh_images())

        lnk = tk.Label(
            body,
            text="¿Producto no aparece? Agrégalo en la pestaña  Catálogo  →",
            bg=WHITE, fg=BLUE, cursor="hand2",
            font=("Helvetica", 9, "underline"), anchor="e",
        )
        lnk.pack(fill="x", pady=(3, 0))
        lnk.bind("<Button-1>", lambda _: self._nb.select(1))

        tk.Label(body, text="2.  Selecciona la imagen:", bg=WHITE,
                 font=("Helvetica", 11, "bold"), anchor="w").pack(fill="x", pady=(14, 5))

        zone = tk.Frame(body, bg=WHITE, highlightbackground=BLUE,
                        highlightthickness=2, cursor="hand2")
        zone.pack(fill="x")
        inner = tk.Frame(zone, bg=WHITE, cursor="hand2")
        inner.pack(fill="x", padx=2, pady=2)

        self._zone_text = tk.Label(
            inner,
            text="Haz clic aquí para seleccionar la imagen\n"
                 "JPG  ·  PNG  ·  WEBP  ·  HEIC  ·  BMP  ·  TIFF",
            bg=WHITE, fg=BLUE, cursor="hand2", font=("Helvetica", 10), pady=22,
        )
        self._zone_text.pack(fill="x")
        self._zone_preview = tk.Label(inner, bg=WHITE)
        self._zone_preview.pack()
        self._zone_fname = tk.Label(inner, text="", bg=WHITE, fg=MUTED,
                                     font=("Helvetica", 8), pady=4)
        self._zone_fname.pack()

        for w in (zone, inner, self._zone_text, self._zone_preview, self._zone_fname):
            w.bind("<Button-1>", lambda _: self._browse())

        self._dest_label = tk.Label(body, text="", bg=LIGHT, fg=MUTED,
                                     font=("Helvetica", 9), pady=5, anchor="w", padx=8)
        self._dest_label.pack(fill="x", pady=(8, 0))

        self._btn = tk.Button(
            body, text="Publicar en el sitio",
            bg=BLUE, fg=WHITE, font=("Helvetica", 12, "bold"),
            relief="flat", bd=0, height=2, cursor="hand2",
            activebackground=BLUE_DRK, activeforeground=WHITE,
            state="disabled", command=self._publish_image,
        )
        self._btn.pack(fill="x", pady=(10, 6))

        tk.Label(body, text="Estado:", bg=WHITE, fg=MUTED,
                 font=("Helvetica", 9), anchor="w").pack(fill="x")
        log_wrap = tk.Frame(body, bg=WHITE)
        log_wrap.pack(fill="x")
        sb = tk.Scrollbar(log_wrap)
        sb.pack(side="right", fill="y")
        self._log = tk.Text(log_wrap, height=5, font=("Courier", 9),
                            bg=LIGHT, relief="flat", bd=1, wrap="word",
                            yscrollcommand=sb.set, state="disabled")
        self._log.pack(fill="x", side="left", expand=True)
        sb.config(command=self._log.yview)

    # ── Catalog tab ───────────────────────────────────────────────────────────

    def _build_catalog_tab(self):
        body = tk.Frame(self._tab_catalog, bg=WHITE)
        body.pack(fill="both", expand=True, padx=16, pady=12)

        # Title row
        title_row = tk.Frame(body, bg=WHITE)
        title_row.pack(fill="x", pady=(0, 6))
        tk.Label(title_row, text="Catálogo de productos", bg=WHITE,
                 font=("Helvetica", 12, "bold"), fg=BLUE).pack(side="left")
        self._dirty_label = tk.Label(title_row, text="", bg=WHITE,
                                      font=("Helvetica", 9), fg=MUTED)
        self._dirty_label.pack(side="left", padx=12)

        # Button bar
        btn_row = tk.Frame(body, bg=WHITE)
        btn_row.pack(fill="x", pady=(0, 6))

        tk.Button(
            btn_row, text="+ Agregar producto",
            bg=BLUE, fg=WHITE, relief="flat", bd=0, cursor="hand2",
            font=("Helvetica", 10, "bold"), padx=12, pady=5,
            command=self._new_product_dialog,
        ).pack(side="left")

        tk.Button(
            btn_row, text="Eliminar seleccionado",
            bg=LIGHT, fg="#CC0000", relief="flat", bd=1, cursor="hand2",
            font=("Helvetica", 10), padx=10, pady=5,
            command=self._delete_selected,
        ).pack(side="left", padx=6)

        tk.Button(
            btn_row, text="Abrir en Excel",
            bg=LIGHT, fg=MUTED, relief="flat", bd=1, cursor="hand2",
            font=("Helvetica", 9), padx=10, pady=5,
            command=self._open_excel,
        ).pack(side="right", padx=6)

        self._save_btn = tk.Button(
            btn_row, text="Guardar y Publicar",
            bg=GREEN, fg=WHITE, relief="flat", bd=0, cursor="hand2",
            font=("Helvetica", 10, "bold"), padx=12, pady=5,
            state="disabled", command=self._publish_catalog,
        )
        self._save_btn.pack(side="right")

        # Hint
        tk.Label(
            body,
            text="Doble clic en una celda para editarla  ·  SKU no es editable",
            bg=WHITE, fg=MUTED, font=("Helvetica", 9),
        ).pack(anchor="w", pady=(0, 4))

        # Treeview + scrollbars
        tree_frame = tk.Frame(body, bg=WHITE)
        tree_frame.pack(fill="both", expand=True)

        vsb = ttk.Scrollbar(tree_frame, orient="vertical")
        hsb = ttk.Scrollbar(tree_frame, orient="horizontal")
        vsb.pack(side="right", fill="y")
        hsb.pack(side="bottom", fill="x")

        self._tree = ttk.Treeview(
            tree_frame, columns=_TREE_COLS, show="headings",
            yscrollcommand=vsb.set, xscrollcommand=hsb.set,
            selectmode="browse",
        )
        vsb.config(command=self._tree.yview)
        hsb.config(command=self._tree.xview)
        self._tree.pack(fill="both", expand=True)

        for col, header, width in zip(_TREE_COLS, _TREE_HEADERS, _TREE_WIDTHS):
            self._tree.heading(col, text=header)
            anchor = "center" if col in ("sku", "category", "unit_price",
                                          "box_price", "available") else "w"
            self._tree.column(col, width=width, anchor=anchor, minwidth=40)

        self._tree.bind("<Double-Button-1>", self._on_tree_double_click)
        self._reload_catalog_tree()

        # Catalog log
        tk.Label(body, text="Estado:", bg=WHITE, fg=MUTED,
                 font=("Helvetica", 9), anchor="w").pack(fill="x", pady=(6, 0))
        log_wrap2 = tk.Frame(body, bg=WHITE)
        log_wrap2.pack(fill="x")
        sb2 = tk.Scrollbar(log_wrap2)
        sb2.pack(side="right", fill="y")
        self._cat_log = tk.Text(log_wrap2, height=3, font=("Courier", 9),
                                 bg=LIGHT, relief="flat", bd=1, wrap="word",
                                 yscrollcommand=sb2.set, state="disabled")
        self._cat_log.pack(fill="x", side="left", expand=True)
        sb2.config(command=self._cat_log.yview)

    def _reload_catalog_tree(self):
        for item in self._tree.get_children():
            self._tree.delete(item)
        for p in self._products:
            self._tree.insert("", "end", values=(
                p["sku"], p["name"], p["category"],
                f"${p['unit_price']:.2f}", f"${p['box_price']:.2f}",
                p["box_contents"], p["available"],
            ))

    # ── Inline cell editing ───────────────────────────────────────────────────

    def _on_tree_double_click(self, event):
        region = self._tree.identify_region(event.x, event.y)
        if region != "cell":
            return
        col_id  = self._tree.identify_column(event.x)
        row_id  = self._tree.identify_row(event.y)
        if not row_id:
            return
        col_idx  = int(col_id.lstrip("#")) - 1
        col_name = _TREE_COLS[col_idx]
        if col_name == "sku":
            return

        bbox = self._tree.bbox(row_id, col_id)
        if not bbox:
            return
        x, y, w, h = bbox

        current_vals = self._tree.item(row_id, "values")
        raw_val = current_vals[col_idx]
        if col_name in ("unit_price", "box_price"):
            raw_val = raw_val.lstrip("$")

        if col_name == "category":
            widget = ttk.Combobox(self._tree, values=CATEGORIES,
                                   state="readonly", font=("Helvetica", 10))
            widget.set(raw_val)
            widget.place(x=x, y=y, width=w, height=h)
            widget.focus_set()

            def _pick(_event=None):
                new_val = widget.get()
                vals = list(current_vals)
                vals[col_idx] = new_val
                self._tree.item(row_id, values=vals)
                self._mark_dirty()
                widget.destroy()

            widget.bind("<<ComboboxSelected>>", _pick)
            widget.bind("<Escape>", lambda _: widget.destroy())
            return

        if col_name == "available":
            widget = ttk.Combobox(self._tree, values=["Y", "N"],
                                   state="readonly", font=("Helvetica", 10))
            widget.set(raw_val)
            widget.place(x=x, y=y, width=w, height=h)
            widget.focus_set()

            def _pick_av(_event=None):
                new_val = widget.get()
                vals = list(current_vals)
                vals[col_idx] = new_val
                self._tree.item(row_id, values=vals)
                self._mark_dirty()
                widget.destroy()

            widget.bind("<<ComboboxSelected>>", _pick_av)
            widget.bind("<Escape>", lambda _: widget.destroy())
            return

        widget = tk.Entry(self._tree, font=("Helvetica", 10))
        widget.insert(0, raw_val)
        widget.select_range(0, "end")
        widget.place(x=x, y=y, width=w, height=h)
        widget.focus_set()

        def _save(_event=None):
            new_val = widget.get().strip()
            if col_name in ("unit_price", "box_price"):
                try:
                    new_val = f"${float(new_val.replace('$', '').replace(',', '')):.2f}"
                except ValueError:
                    widget.destroy()
                    return
            vals = list(current_vals)
            vals[col_idx] = new_val
            self._tree.item(row_id, values=vals)
            self._mark_dirty()
            widget.destroy()

        widget.bind("<Return>",   _save)
        widget.bind("<FocusOut>", _save)
        widget.bind("<Escape>",   lambda _: widget.destroy())

    def _mark_dirty(self):
        self._catalog_dirty = True
        self._dirty_label.config(text="● Cambios sin guardar", fg="#B85C00")
        self._save_btn.config(state="normal")

    def _mark_clean(self):
        self._catalog_dirty = False
        self._dirty_label.config(text="✓ Publicado", fg=GREEN)
        self._save_btn.config(state="disabled")

    def _delete_selected(self):
        sel = self._tree.selection()
        if not sel:
            messagebox.showinfo("Eliminar", "Selecciona un producto primero.")
            return
        vals = self._tree.item(sel[0], "values")
        sku, name = vals[0], vals[1]
        if not messagebox.askyesno(
            "Confirmar eliminación",
            f"¿Eliminar '{name}' (SKU {sku})?\n\n"
            "El producto dejará de aparecer en el sitio.",
        ):
            return
        self._tree.delete(sel[0])
        self._mark_dirty()

    def _treeview_to_products(self):
        products = []
        for row_id in self._tree.get_children():
            vals = self._tree.item(row_id, "values")
            sku, name, category, unit_price, box_price, box_contents, available = vals
            try:
                up = round(float(str(unit_price).replace("$", "").replace(",", "")), 2)
            except ValueError:
                up = 0.0
            try:
                bp = round(float(str(box_price).replace("$", "").replace(",", "")), 2)
            except ValueError:
                bp = 0.0
            products.append({
                "sku":          str(sku),
                "name":         str(name),
                "category":     str(category),
                "unit_price":   up,
                "box_price":    bp,
                "box_contents": str(box_contents),
                "available":    str(available).strip().upper(),
            })
        return products

    # ── New product dialog ────────────────────────────────────────────────────

    def _new_product_dialog(self):
        dlg = tk.Toplevel(self)
        dlg.title("Nuevo producto")
        dlg.geometry("380x440")
        dlg.resizable(False, False)
        dlg.configure(bg=WHITE)
        dlg.grab_set()

        body = tk.Frame(dlg, bg=WHITE)
        body.pack(fill="both", expand=True, padx=22, pady=16)

        fields = {}

        def _field(label, key, default="", combo_opts=None):
            tk.Label(body, text=label, bg=WHITE,
                     font=("Helvetica", 10, "bold"), anchor="w").pack(fill="x")
            var = tk.StringVar(value=default)
            if combo_opts:
                w = ttk.Combobox(body, textvariable=var, values=combo_opts,
                                  state="readonly", font=("Helvetica", 10))
            else:
                w = tk.Entry(body, textvariable=var, font=("Helvetica", 10))
            w.pack(fill="x", pady=(2, 8))
            fields[key] = var
            return w

        sku_entry = _field("SKU  *", "sku")
        sku_entry.focus_set()
        _field("Nombre del producto  *", "name")
        _field("Categoría  *", "category", "Cleaning", CATEGORIES)
        _field("Precio unitario ($)  *", "unit_price", "0.00")
        _field("Precio por caja ($)  *", "box_price",  "0.00")
        _field("Contenido por caja  *", "box_contents", "12 Units/Box")
        _field("Activo (Y/N)", "available", "Y", ["Y", "N"])

        err = tk.Label(body, text="", bg=WHITE, fg="red", font=("Helvetica", 9))
        err.pack(fill="x")

        def _save():
            data = {k: v.get().strip() for k, v in fields.items()}
            if not data["sku"]:
                err.config(text="El SKU es obligatorio.")
                return
            if not data["name"]:
                err.config(text="El nombre es obligatorio.")
                return
            existing_skus = [self._tree.item(r, "values")[0]
                             for r in self._tree.get_children()]
            if data["sku"] in existing_skus:
                err.config(text=f"El SKU '{data['sku']}' ya existe.")
                return
            try:
                up = round(float(data["unit_price"]), 2)
                bp = round(float(data["box_price"]), 2)
            except ValueError:
                err.config(text="Los precios deben ser números (ej: 1.99).")
                return
            self._tree.insert("", "end", values=(
                data["sku"], data["name"], data["category"],
                f"${up:.2f}", f"${bp:.2f}",
                data["box_contents"], data["available"],
            ))
            self._mark_dirty()
            dlg.destroy()

        btn_row = tk.Frame(body, bg=WHITE)
        btn_row.pack(fill="x", pady=(4, 0))
        tk.Button(btn_row, text="Cancelar", command=dlg.destroy,
                  font=("Helvetica", 10), relief="flat", bg=LIGHT,
                  cursor="hand2").pack(side="right", padx=(6, 0))
        tk.Button(btn_row, text="Agregar", command=_save,
                  font=("Helvetica", 10, "bold"), relief="flat",
                  bg=BLUE, fg=WHITE, cursor="hand2").pack(side="right")

        dlg.bind("<Return>", lambda _: _save())

    # ── Catalog publish ───────────────────────────────────────────────────────

    def _publish_catalog(self):
        if self._publishing:
            return
        self._publishing = True
        self._save_btn.config(state="disabled", text="Publicando...")
        self._cat_log_clear()
        products = self._treeview_to_products()
        threading.Thread(target=self._publish_catalog_worker,
                         args=(products,), daemon=True).start()

    def _publish_catalog_worker(self, products):
        try:
            self._cat_log_write("Guardando Excel...")
            self._write_excel_products(products)
            self._cat_log_write("✓ products.xlsx actualizado")

            self._cat_log_write("Regenerando catálogo JSON...")
            r = subprocess.run(
                [sys.executable, str(GENERATE_SCRIPT)],
                capture_output=True, text=True, cwd=str(REPO_ROOT),
            )
            if r.returncode != 0:
                raise RuntimeError(f"generate-products.py falló:\n{r.stderr or r.stdout}")
            self._cat_log_write("✓ products.json actualizado")

            self._cat_log_write("Sincronizando con GitHub...")
            pull = subprocess.run(
                ["git", "pull", "--rebase", "origin", "main"],
                capture_output=True, text=True, cwd=str(REPO_ROOT),
            )
            if pull.returncode != 0:
                subprocess.run(["git", "rebase", "--abort"],
                               capture_output=True, cwd=str(REPO_ROOT))
                self._cat_log_write(f"  (aviso sync: {pull.stderr.strip()[:80]})")

            subprocess.run(
                ["git", "add", "data/products.json"],
                capture_output=True, cwd=str(REPO_ROOT), check=True,
            )
            commit = subprocess.run(
                ["git", "commit", "-m", "feat: actualizar catálogo de productos"],
                capture_output=True, text=True, cwd=str(REPO_ROOT),
            )
            commit_out = (commit.stdout + commit.stderr).lower()
            if commit.returncode != 0 and "nothing to commit" not in commit_out:
                raise RuntimeError(f"git commit falló:\n{commit.stderr}")
            self._cat_log_write("✓ Commit creado")

            push = subprocess.run(
                ["git", "push", "origin", "main"],
                capture_output=True, text=True, cwd=str(REPO_ROOT),
            )
            if push.returncode != 0:
                raise RuntimeError(
                    "Sin conexión a internet. El catálogo se guardó localmente.\n"
                    "Intenta publicar de nuevo cuando tengas conexión.\n\n"
                    f"Detalle:\n{push.stderr.strip()[:200]}"
                )

            self._cat_log_write(f"✓ ¡Publicado! → {SITE_URL}")
            self.after(0, self._on_catalog_success, products)

        except FileNotFoundError as exc:
            if "git" in str(exc).lower():
                msg = (
                    "Git no está instalado en este equipo.\n\n"
                    "Descarga e instala Git para Windows (git-scm.com)\n"
                    "y reinicia la app.\n\nContacta a Samuel:\n+57 304 353 8450"
                )
            else:
                msg = f"Archivo no encontrado:\n{exc}"
            self.after(0, self._on_catalog_error, msg)
        except Exception as exc:
            self.after(0, self._on_catalog_error, str(exc))

    def _on_catalog_success(self, products):
        self._publishing = False
        self._products = products
        self._update_combo()
        self._save_btn.config(text="Guardar y Publicar")
        self._mark_clean()
        messagebox.showinfo(
            "¡Catálogo publicado!",
            f"Los cambios están en línea.\n\nEl sitio se actualiza en 1-2 minutos:\n{SITE_URL}",
        )

    def _on_catalog_error(self, msg):
        self._publishing = False
        self._save_btn.config(text="Guardar y Publicar", state="normal")
        self._cat_log_write(f"\n✗ Error: {msg}")
        messagebox.showerror("Error al publicar catálogo", msg)

    # ── Images tab helpers ────────────────────────────────────────────────────

    def _update_combo(self):
        self._combo.config(
            values=[f"{p['sku']}{SEP}{p['name']}" for p in self._products]
        )

    def _selected_sku(self):
        v = self._combo_var.get()
        return v.split(SEP)[0].strip() if v else None

    def _selected_name(self):
        v = self._combo_var.get()
        parts = v.split(SEP, 1)
        return parts[1].strip() if len(parts) > 1 else ""

    def _refresh_images(self):
        sku = self._selected_sku()
        if sku and self._image_path:
            self._dest_label.config(text=f"  Destino:  img/productos/{sku}.jpg")
        elif sku:
            self._dest_label.config(text=f"  Producto: {sku} — falta la imagen")
        else:
            self._dest_label.config(text="")
        self._btn.config(state="normal" if (sku and self._image_path) else "disabled")

    def _browse(self):
        path = filedialog.askopenfilename(
            title="Seleccionar imagen del producto",
            filetypes=[
                ("Imágenes", "*.jpg *.jpeg *.png *.webp *.heic *.bmp *.tiff *.tif"),
                ("Todos los archivos", "*.*"),
            ],
        )
        if not path:
            return
        p = Path(path)
        if p.suffix.lower() not in ACCEPTED_EXTS:
            messagebox.showerror(
                "Formato no compatible",
                f"'{p.name}' no es compatible.\n"
                "Usa: JPG, PNG, WEBP, HEIC, BMP o TIFF.",
            )
            return
        self._image_path = p
        self._zone_text.config(text="Clic para cambiar imagen", pady=6)
        self._zone_fname.config(text=p.name)
        self._show_preview(p)
        self._refresh_images()

    def _show_preview(self, path: Path):
        if not PILLOW_OK:
            return
        try:
            img = Image.open(path)
            img.thumbnail((130, 90), Image.LANCZOS)
            self._preview_photo = ImageTk.PhotoImage(img)
            self._zone_preview.config(image=self._preview_photo)
        except Exception:
            pass

    # ── Image publish ─────────────────────────────────────────────────────────

    def _publish_image(self):
        if self._publishing:
            return
        self._publishing = True
        self._btn.config(state="disabled", text="Publicando...")
        self._log_clear()
        threading.Thread(target=self._publish_image_worker, daemon=True).start()

    def _publish_image_worker(self):
        sku  = self._selected_sku()
        name = self._selected_name()
        src  = self._image_path

        try:
            if not src or not src.exists():
                raise RuntimeError(
                    f"El archivo de imagen ya no existe:\n{src}\n\n"
                    "Selecciona la imagen de nuevo."
                )
            IMG_DIR.mkdir(parents=True, exist_ok=True)
            if not PILLOW_OK:
                raise RuntimeError(
                    "Pillow no está instalado.\nCorre tools/setup.bat primero."
                )

            dest = IMG_DIR / f"{sku}.jpg"
            self._log_write("Convirtiendo imagen a JPG...")
            img = Image.open(src)
            if img.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", img.size, (234, 240, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                if img.mode in ("RGBA", "LA"):
                    background.paste(img, mask=img.getchannel("A"))
                else:
                    background.paste(img)
                img = background
            elif img.mode != "RGB":
                img = img.convert("RGB")
            img.save(dest, "JPEG", quality=90)
            self._log_write(f"✓ Guardada como {sku}.jpg")

            self._log_write("Regenerando catálogo de productos...")
            r = subprocess.run(
                [sys.executable, str(GENERATE_SCRIPT)],
                capture_output=True, text=True, cwd=str(REPO_ROOT),
            )
            if r.returncode != 0:
                raise RuntimeError(f"generate-products.py falló:\n{r.stderr or r.stdout}")
            self._log_write("✓ products.json actualizado")

            self._log_write("Sincronizando con GitHub...")
            pull = subprocess.run(
                ["git", "pull", "--rebase", "origin", "master"],
                capture_output=True, text=True, cwd=str(REPO_ROOT),
            )
            if pull.returncode != 0:
                subprocess.run(["git", "rebase", "--abort"],
                               capture_output=True, cwd=str(REPO_ROOT))
                self._log_write(f"  (aviso sync: {pull.stderr.strip()[:80]})")

            img_rel = dest.relative_to(REPO_ROOT).as_posix()
            subprocess.run(
                ["git", "add", img_rel, "data/products.json"],
                capture_output=True, cwd=str(REPO_ROOT), check=True,
            )
            commit = subprocess.run(
                ["git", "commit", "-m", f"feat: imagen {sku} - {name}"],
                capture_output=True, text=True, cwd=str(REPO_ROOT),
            )
            commit_out = (commit.stdout + commit.stderr).lower()
            if commit.returncode != 0 and "nothing to commit" not in commit_out:
                raise RuntimeError(f"git commit falló:\n{commit.stderr}")
            self._log_write("✓ Commit creado")

            self._log_write("Subiendo a GitHub...")
            push = subprocess.run(
                ["git", "push", "origin", "master"],
                capture_output=True, text=True, cwd=str(REPO_ROOT),
            )
            if push.returncode != 0:
                raise RuntimeError(
                    "Sin conexión a internet. La imagen se guardó localmente.\n"
                    "Intenta publicar de nuevo cuando tengas conexión.\n\n"
                    f"Detalle:\n{push.stderr.strip()[:200]}"
                )

            self._log_write(f"✓ ¡Publicado! → {SITE_URL}")
            self.after(0, self._on_image_success, name)

        except FileNotFoundError as exc:
            if "git" in str(exc).lower():
                msg = (
                    "Git no está instalado en este equipo.\n\n"
                    "1. Descarga Git desde git-scm.com\n"
                    "2. Instala con opciones predeterminadas\n"
                    "3. Reinicia la app\n\nContacta a Samuel:\n+57 304 353 8450"
                )
            else:
                msg = f"Archivo no encontrado:\n{exc}"
            self.after(0, self._on_image_error, msg)
        except Exception as exc:
            self.after(0, self._on_image_error, str(exc))

    def _on_image_success(self, product_name):
        self._publishing    = False
        self._image_path    = None
        self._preview_photo = None
        self._zone_text.config(
            text="Haz clic aquí para seleccionar la imagen\n"
                 "JPG  ·  PNG  ·  WEBP  ·  HEIC  ·  BMP  ·  TIFF",
            pady=22,
        )
        self._zone_preview.config(image="")
        self._zone_fname.config(text="")
        self._btn.config(text="Publicar en el sitio", bg=BLUE)
        self._refresh_images()
        messagebox.showinfo(
            "¡Publicado correctamente!",
            f"La imagen de '{product_name}' está en línea.\n\n"
            f"El sitio se actualiza en 1-2 minutos:\n{SITE_URL}",
        )

    def _on_image_error(self, msg):
        self._publishing = False
        self._log_write(f"\n✗ Error: {msg}")
        self._btn.config(text="Publicar en el sitio", bg=BLUE)
        self._refresh_images()
        messagebox.showerror("Error al publicar", msg)

    # ── Log helpers ───────────────────────────────────────────────────────────

    def _log_write(self, msg):
        def _do():
            self._log.config(state="normal")
            self._log.insert("end", msg + "\n")
            self._log.see("end")
            self._log.config(state="disabled")
        self.after(0, _do)

    def _log_clear(self):
        self._log.config(state="normal")
        self._log.delete("1.0", "end")
        self._log.config(state="disabled")

    def _cat_log_write(self, msg):
        def _do():
            self._cat_log.config(state="normal")
            self._cat_log.insert("end", msg + "\n")
            self._cat_log.see("end")
            self._cat_log.config(state="disabled")
        self.after(0, _do)

    def _cat_log_clear(self):
        self._cat_log.config(state="normal")
        self._cat_log.delete("1.0", "end")
        self._cat_log.config(state="disabled")

    # ── Menu handlers ─────────────────────────────────────────────────────────

    def _open_excel(self):
        if not EXCEL_PATH.exists():
            messagebox.showinfo("Excel",
                                f"No se encontró data/products.xlsx.\nEsperado en:\n{EXCEL_PATH}")
            return
        try:
            os.startfile(str(EXCEL_PATH))
        except Exception as e:
            messagebox.showerror("Error", f"No se pudo abrir el Excel:\n{e}")

    def _show_images(self):
        if not IMG_DIR.exists():
            messagebox.showinfo("Imágenes", "La carpeta img/productos/ no existe aún.")
            return
        imgs = sorted(IMG_DIR.iterdir())
        if not imgs:
            messagebox.showinfo("Imágenes", "No hay imágenes en img/productos/")
            return
        sku_set = {p["sku"] for p in self._products}
        lines = [
            ("✓" if i.stem in sku_set else "○") + f"  {i.name}"
            + ("  ← activo" if i.stem in sku_set else "")
            for i in imgs
        ]
        win = tk.Toplevel(self)
        win.title("Imágenes actuales")
        win.geometry("440x300")
        win.configure(bg=WHITE)
        tk.Label(win,
                 text="✓ = asignada a un SKU activo   ○ = no usada por ningún producto",
                 bg=WHITE, fg=MUTED, font=("Helvetica", 9)).pack(anchor="w", padx=12, pady=(10, 4))
        t = tk.Text(win, font=("Courier", 9), bg=LIGHT, wrap="none")
        t.pack(fill="both", expand=True, padx=12, pady=(0, 12))
        t.insert("1.0", "\n".join(lines))
        t.config(state="disabled")

    def _verify_status(self):
        try:
            r = subprocess.run(["git", "status", "--short"],
                               capture_output=True, text=True,
                               cwd=str(REPO_ROOT), check=True)
            out = r.stdout.strip() or "✓ Todo sincronizado con GitHub."
        except FileNotFoundError:
            out = "✗ Git no está instalado."
        except Exception as e:
            out = str(e)
        win = tk.Toplevel(self)
        win.title("Estado del repositorio")
        win.geometry("400x220")
        win.configure(bg=WHITE)
        t = tk.Text(win, font=("Courier", 9), bg=LIGHT, height=8)
        t.pack(fill="both", expand=True, padx=12, pady=12)
        t.insert("1.0", out)
        t.config(state="disabled")

    def _contact_support(self):
        webbrowser.open(
            "mailto:samueldavidvida@gmail.com"
            "?subject=Docolco%20Product%20Manager%20-%20Soporte"
        )

    # ── Startup check ─────────────────────────────────────────────────────────

    def _startup_check(self):
        issues = []
        try:
            subprocess.run(["git", "--version"], capture_output=True, check=True)
        except (FileNotFoundError, subprocess.CalledProcessError):
            issues.append(
                "• Git no está instalado.\n"
                "  Descarga e instala Git para Windows (git-scm.com)."
            )
        if not PILLOW_OK:
            issues.append(
                "• Pillow no está instalado.\n"
                "  Corre tools/setup.bat primero."
            )
        if not OPENPYXL_OK:
            issues.append(
                "• openpyxl no está instalado.\n"
                "  Corre tools/setup.bat primero."
            )
        try:
            IMG_DIR.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            issues.append(f"• No se pudo crear img/productos/:\n  {e}")
        if not GENERATE_SCRIPT.exists():
            issues.append(
                "• No se encontró generate-products.py.\n"
                f"  Esperado en: {GENERATE_SCRIPT}"
            )
        if not EXCEL_PATH.exists():
            issues.append(
                "• No se encontró data/products.xlsx.\n"
                f"  Esperado en: {EXCEL_PATH}"
            )
        try:
            r = subprocess.run(["git", "remote", "-v"],
                               capture_output=True, text=True, cwd=str(REPO_ROOT))
            if not r.stdout.strip():
                issues.append("• El repositorio no tiene un remote de GitHub configurado.")
        except Exception:
            pass
        if issues:
            messagebox.showwarning(
                "Verificación inicial — problemas encontrados",
                "\n\n".join(issues)
                + "\n\nContacta a Samuel:\nsamueldavidvida@gmail.com\n+57 304 353 8450",
            )


if __name__ == "__main__":
    app = ImageManagerApp()
    app.mainloop()

