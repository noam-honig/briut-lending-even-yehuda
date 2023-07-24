import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BusyService, openDialog } from '@remult/angular';
import { GridSettings, RowButton } from '@remult/angular/interfaces';
import { Remult } from 'remult';
import { InputAreaComponent } from '../common/input-area/input-area.component';
import { Roles } from '../users/roles';
import { isValidPhone, Lending } from './lending';
import { saveToExcel } from '../common/saveGridToExcel';

@Component({
  selector: 'app-lendings',
  templateUrl: './lendings.component.html',
  styleUrls: ['./lendings.component.scss'],
})
export class LendingsComponent implements OnInit {
  constructor(
    private remult: Remult,
    private route: ActivatedRoute,
    private busy: BusyService
  ) {}
  grid = new GridSettings(this.remult.repo(Lending), {
    allowUpdate: true,
    knowTotalRows: true,
    numOfColumnsInGrid: 100,
    rowCssClass: (l) => (l.returnDate != null ? 'returned' : ''),
    rowButtons: lendingRowButtons(this.remult),
    gridButtons: [
      {
        name: 'excel',
        click: async () => {
          saveToExcel(this.grid, 'השאלות', this.busy);
        },
      },
    ],
  });
  ngOnInit(): void {}
}

export const lendingRowButtons = (remult: Remult) =>
  [
    {
      name: 'ערוך',
      icon: 'edit',
      click: (l) => showLendDialog(l, remult),
    },
    {
      name: 'שלח קישור לטופס בווטסאפ',
      click: (l) => l.sendFormInWhatsapp(),
    },
    {
      name: 'עדכן החזרה',
      click: async (l) => {
        if (l.returnDate) l.returnDate = null!;
        else l.returnDate = new Date();
        await l.save();
      },
    },
    {
      name: 'פתח ווטסאפ',
      click: async (l) => {
        l.sendWhatsapp('שלום ' + l.firstName);
      },
    },
    {
      name: 'חייג',
      icon: 'phone',
      click: async (l) => {
        window.location.href = 'tel:' + l.phone;
      },
    },
  ] as RowButton<Lending>[];

export function showLendDialog(l: Lending, remult: Remult, ok?: VoidFunction) {
  function setReturnDateBasedOnDate() {
    let x = new Date(l.lendDate);
    x.setMonth(x.getMonth() + 2);
    l.plannedReturnDate = x;
  }
  if (l._.isNew()) setReturnDateBasedOnDate();
  openDialog(
    InputAreaComponent,
    (x) =>
      (x.args = {
        title: 'השאלת ' + l.item.name,
        fields: () => [
          {
            field: l.$.phone,
            valueChange: () => {
              if (isValidPhone(l.phone)) {
                remult
                  .repo(Lending)
                  .findFirst({ phone: l.phone })
                  .then((prev) => {
                    if (prev) {
                      l.lastName = prev.lastName;
                      l.firstName = prev.firstName;
                      l.address = prev.address;
                    }
                  });
              }
            },
          },
          l.$.firstName,
          l.$.lastName,
          {
            field: l.$.lendDate,
            valueChange: () => {
              setReturnDateBasedOnDate();
            },
          },
          l.$.plannedReturnDate,
          {
            field: l.$.returnDate,
            visible: () => !l.isNew(),
          },
          l.$.deposit,
          l.$.depositType,
          l.$.address,
        ],
        ok: async () => {
          await l.save();
          if (ok) ok();
        },
      })
  );
}
