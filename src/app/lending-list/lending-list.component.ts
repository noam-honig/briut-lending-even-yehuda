import { Component, Input, OnInit } from '@angular/core';
import { RowButton } from '@remult/angular/interfaces';
import { Remult } from 'remult';
import { Item } from '../items/item';
import { Lending } from '../lengdings/lending';
import { lendingRowButtons } from '../lengdings/lendings.component';

@Component({
  selector: 'app-lending-list',
  templateUrl: './lending-list.component.html',
  styleUrls: ['./lending-list.component.scss']
})
export class LendingListComponent implements OnInit {


  constructor(private remult: Remult) { }
  lendings: Lending[] = [];
  buttons: RowButton<Lending>[] = lendingRowButtons(this.remult);
  @Input()
  item?: Item;
  async ngOnInit() {
    this.lendings = await this.remult.repo(Lending).find({
      where: {
        item: this.item
      }
    });
  }

}
