import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GridSettings } from '@remult/angular/interfaces';
import { Remult } from 'remult';
import { Roles } from '../users/roles';
import { Lending } from './lending';

@Component({
  selector: 'app-lendings',
  templateUrl: './lendings.component.html',
  styleUrls: ['./lendings.component.scss']
})
export class LendingsComponent implements OnInit {

  constructor(private remult: Remult, private route: ActivatedRoute) { }
  grid = new GridSettings(this.remult.repo(Lending), {
    allowUpdate: true,
    numOfColumnsInGrid: 100,
    rowCssClass: l => l.returnDate != null ? 'returned' : '',
    rowButtons: [
      {
        name: 'שלח קישור לטופס בווטסאפ',
        click: l => l.sendWhatsappToPhone()
      },
      {
        name: 'עדכן החזרה',
        click: async l => {
          if (l.returnDate)
            l.returnDate = null!;
          else l.returnDate = new Date();
          await l.save();
        }
      },
    ]
  });
  ngOnInit(): void {

  }

}
