import { Component, OnInit } from '@angular/core';
import { Item } from '../items/item';

@Component({
  selector: 'app-item-lending',
  templateUrl: './item-lending.component.html',
  styleUrls: ['./item-lending.component.scss']
})
export class ItemLendingComponent implements OnInit {

  constructor() { }
  item!: Item;

  ngOnInit(): void {
  }

}
