import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { openDialog } from '@remult/angular';
import { DataAreaSettings } from '@remult/angular/interfaces';
import { Fields, getValueList, Remult } from 'remult';
import { DialogService } from '../common/dialog';
import { InputAreaComponent } from '../common/input-area/input-area.component';
import { Item } from '../items/item';
import { isValidPhone, Lending } from '../lengdings/lending';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private remult: Remult) {

  }
  items: Item[] = [];
  async ngOnInit() {
    this.items = await this.remult.repo(Item).find({ where: { quantity: { ">": 0 } } })
  }
  lend(item: Item) {
    const l = this.remult.repo(Lending).create({ item });
    setReturnDateBasedOnDate();
    openDialog(InputAreaComponent, x => x.args = {
      title: "השאלת " + item.name,
      fields: () => [{
        field: l.$.phone,
        valueChange: () => {
          if (isValidPhone(l.phone)) {
            this.remult.repo(Lending).findFirst({ phone: l.phone }).then(prev => {
              if (prev) {
                l.lastName = prev.lastName;
                l.firstName = prev.firstName;
                l.address = prev.address;
              }
            });

          }
        }
      }, l.$.firstName, l.$.lastName, {
        field: l.$.lendDate, valueChange: () => {
          setReturnDateBasedOnDate();
        }
      }, l.$.plannedReturnDate, l.$.deposit, l.$.depositType, l.$.address],
      ok: async () => {
        await l.save();
        item._.reload();
      }
    });

    function setReturnDateBasedOnDate() {
      let x = new Date(l.lendDate);
      x.setMonth(x.getMonth() + 2);
      l.plannedReturnDate = x;
    }
  };
}

