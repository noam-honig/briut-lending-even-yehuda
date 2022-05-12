import { Component, OnInit } from '@angular/core';
import { GridSettings } from '@remult/angular/interfaces';
import { Remult } from 'remult';
import { Item } from './item';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit {

  constructor(private remult: Remult) { }
  grid = new GridSettings(this.remult.repo(Item), { allowCrud: true, knowTotalRows: true });
  ngOnInit(): void {
  }

}
