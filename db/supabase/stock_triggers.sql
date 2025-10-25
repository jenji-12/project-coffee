-- Auto stock update on sale_items insert/update/delete
-- Assumes tables: sales(id, shop_id, status), sale_items(id, sale_id, product_id, qty),
-- stock_items(shop_id, product_id, quantity_on_hand), stock_movements(shop_id, product_id, qty_change, reason, ref_sale_id, note)

create or replace function public.stock_apply_delta(p_shop uuid, p_product uuid, p_delta numeric, p_reason text, p_sale uuid, p_note text)
returns void language plpgsql as $$
begin
  -- upsert stock_items
  insert into stock_items (shop_id, product_id, quantity_on_hand)
  values (p_shop, p_product, 0)
  on conflict (shop_id, product_id) do nothing;

  -- movement
  insert into stock_movements (shop_id, product_id, qty_change, reason, ref_sale_id, note)
  values (p_shop, p_product, p_delta, p_reason, p_sale, p_note);

  -- accumulate
  update stock_items
  set quantity_on_hand = coalesce(quantity_on_hand,0) + p_delta,
      updated_at = now()
  where shop_id = p_shop and product_id = p_product;
end;
$$;

create or replace function public.stock_on_sale_items_change()
returns trigger language plpgsql as $$
declare
  v_shop uuid;
  v_delta numeric;
begin
  -- find shop
  if (TG_OP = 'INSERT') then
    if NEW.product_id is null then
      return NEW;
    end if;
    select shop_id into v_shop from sales where id = NEW.sale_id;
    v_delta := -1 * coalesce(NEW.qty,0);
    perform public.stock_apply_delta(v_shop, NEW.product_id, v_delta, 'sale', NEW.sale_id, 'sale_items insert');
    return NEW;

  elsif (TG_OP = 'UPDATE') then
    if NEW.product_id is null then
      return NEW;
    end if;
    select shop_id into v_shop from sales where id = NEW.sale_id;
    v_delta := -1 * (coalesce(NEW.qty,0) - coalesce(OLD.qty,0));
    if v_delta <> 0 then
      perform public.stock_apply_delta(v_shop, NEW.product_id, v_delta, 'sale_adj', NEW.sale_id, 'sale_items update qty');
    end if;
    return NEW;

  elsif (TG_OP = 'DELETE') then
    if OLD.product_id is null then
      return OLD;
    end if;
    select shop_id into v_shop from sales where id = OLD.sale_id;
    v_delta := coalesce(OLD.qty,0); -- reverse
    perform public.stock_apply_delta(v_shop, OLD.product_id, v_delta, 'sale_void', OLD.sale_id, 'sale_items delete');
    return OLD;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_stock_on_sale_items_change on sale_items;
create trigger trg_stock_on_sale_items_change
after insert or update or delete on sale_items
for each row execute function public.stock_on_sale_items_change();

-- View for low stock
create or replace view v_low_stock as
select si.shop_id, si.product_id, p.name as product_name, si.quantity_on_hand, si.reorder_point, (si.quantity_on_hand <= coalesce(si.reorder_point,0)) as is_low
from stock_items si
join products p on p.id = si.product_id;
