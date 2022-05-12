import { Component, OnInit } from '@angular/core';
import { RowButton } from '@remult/angular/interfaces';
import { Remult } from 'remult';
import { Lending } from '../lengdings/lending';
import { lendingRowButtons } from '../lengdings/lendings.component';

@Component({
  selector: 'app-lending-list',
  templateUrl: './lending-list.component.html',
  styleUrls: ['./lending-list.component.scss']
})
export class LendingListComponent implements OnInit {

  buttons: RowButton<Lending>[] = lendingRowButtons;
  constructor(private remult: Remult) { }
  lendings: Lending[] = [];
  async ngOnInit() {
    this.lendings = await this.remult.repo(Lending).find();
  }

}
