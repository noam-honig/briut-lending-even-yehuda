import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { openDialog } from '@remult/angular';
import { DataAreaSettings, RowButton } from '@remult/angular/interfaces';
import { Fields, getValueList, Remult } from 'remult';
import { DialogService } from '../common/dialog';
import { InputAreaComponent } from '../common/input-area/input-area.component';
import { ItemLendingComponent } from '../item-lending/item-lending.component';
import { Item } from '../items/item';
import { isValidPhone, Lending } from '../lengdings/lending';
import { showLendDialog } from '../lengdings/lendings.component';
import { Roles } from '../users/roles';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private remult: Remult, private zone: NgZone) {

  }
  buttons: RowButton<Item>[] = [{
    name: 'השאלות פעילות'
  }];
  isAdmin() {
    return this.remult.isAllowed(Roles.admin);
  }
  items: Item[] = [];
  async ngOnInit() {
    this.items = await this.remult.repo(Item).find({ where: { quantity: { ">": 0 } } })
  }
  history(item: Item) {
    openDialog(ItemLendingComponent, x => x.item = item);
  }
  lend(item: Item) {
    if (!this.isAdmin())
      return;
    const l = this.remult.repo(Lending).create({ item });
    showLendDialog(l, this.remult, () => {
      if (!window.document.title.includes("צורן"))
        this.zone.run(() =>
          l.sendFormInWhatsapp());
      item._.reload();
    });
  };
}

